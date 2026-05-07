/*
  # Digital Products System

  1. Schema Changes
    - Add `product_type` column to products table
      - 'physical' for regular products
      - 'digital' for downloadable products (ebooks, courses, etc.)
    - Add `digital_file_url` column for storing file path
    - Add `digital_file_size` for file size in bytes
    - Add `digital_file_type` for file MIME type
    - Add `download_limit` for number of allowed downloads (null = unlimited)
    - Add `access_duration_days` for how long access is valid (null = forever)

  2. New Tables
    - `digital_downloads`
      - Tracks all download access for customers
      - Links orders to digital products
      - Manages download limits and expiration
    
    - `download_tokens`
      - Secure tokens for file downloads
      - Expires after single use or time limit
      - Prevents unauthorized access

  3. Security
    - Enable RLS on all new tables
    - Only customers can access their own downloads
    - Merchants can view download analytics
    - Download tokens expire after use

  4. Features
    - Automatic delivery after successful payment
    - Download tracking and analytics
    - Configurable download limits
    - Time-limited access
    - Secure token-based downloads
*/

-- Add digital product columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE products ADD COLUMN product_type text DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'digital_file_url'
  ) THEN
    ALTER TABLE products ADD COLUMN digital_file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'digital_file_size'
  ) THEN
    ALTER TABLE products ADD COLUMN digital_file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'digital_file_type'
  ) THEN
    ALTER TABLE products ADD COLUMN digital_file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'download_limit'
  ) THEN
    ALTER TABLE products ADD COLUMN download_limit integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'access_duration_days'
  ) THEN
    ALTER TABLE products ADD COLUMN access_duration_days integer;
  END IF;
END $$;

-- Create digital_downloads table
CREATE TABLE IF NOT EXISTS digital_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_email text NOT NULL,
  download_count integer DEFAULT 0,
  last_downloaded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create download_tokens table
CREATE TABLE IF NOT EXISTS download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_download_id uuid REFERENCES digital_downloads(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE digital_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Digital Downloads Policies
CREATE POLICY "Customers can view their own downloads"
  ON digital_downloads FOR SELECT
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.id = digital_downloads.order_id
      AND s.merchant_id = auth.uid()
    )
  );

CREATE POLICY "System can insert digital downloads"
  ON digital_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update download counts"
  ON digital_downloads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Download Tokens Policies
CREATE POLICY "Token owners can view their tokens"
  ON download_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM digital_downloads dd
      WHERE dd.id = download_tokens.digital_download_id
      AND dd.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "System can insert download tokens"
  ON download_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update tokens"
  ON download_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_digital_downloads_order_id ON digital_downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_product_id ON digital_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_customer_email ON digital_downloads(customer_email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_digital_download_id ON download_tokens(digital_download_id);

-- Function to create digital downloads after successful payment
CREATE OR REPLACE FUNCTION create_digital_downloads_after_payment()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  product_record RECORD;
  expires_at_date timestamptz;
BEGIN
  -- Only process completed orders
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Loop through order items
    FOR order_item IN 
      SELECT * FROM json_array_elements(NEW.items::json)
    LOOP
      -- Get product details
      SELECT * INTO product_record 
      FROM products 
      WHERE id = (order_item.value->>'product_id')::uuid
      AND product_type = 'digital';
      
      -- If it's a digital product, create download access
      IF FOUND THEN
        -- Calculate expiration date if access duration is set
        IF product_record.access_duration_days IS NOT NULL THEN
          expires_at_date := now() + (product_record.access_duration_days || ' days')::interval;
        ELSE
          expires_at_date := NULL;
        END IF;
        
        -- Create digital download record
        INSERT INTO digital_downloads (
          order_id,
          product_id,
          customer_email,
          expires_at
        ) VALUES (
          NEW.id,
          product_record.id,
          NEW.customer_email,
          expires_at_date
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic digital download creation
DROP TRIGGER IF EXISTS create_digital_downloads_trigger ON orders;
CREATE TRIGGER create_digital_downloads_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_digital_downloads_after_payment();

-- Function to generate secure download token
CREATE OR REPLACE FUNCTION generate_download_token(download_id uuid)
RETURNS text AS $$
DECLARE
  new_token text;
  token_expiry timestamptz;
BEGIN
  -- Generate secure random token
  new_token := encode(gen_random_bytes(32), 'base64');
  
  -- Token expires in 1 hour
  token_expiry := now() + interval '1 hour';
  
  -- Insert token
  INSERT INTO download_tokens (
    digital_download_id,
    token,
    expires_at
  ) VALUES (
    download_id,
    new_token,
    token_expiry
  );
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;