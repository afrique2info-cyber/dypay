/*
  # Add Stock Management to Products

  1. Changes to Products Table
    - Add `stock_quantity` column to track available inventory
    - Add `low_stock_threshold` column to set alert levels
    - Add `track_stock` boolean to enable/disable stock tracking per product
    - Add `sku` (Stock Keeping Unit) for product identification

  2. New Stock History Table
    - Track all stock movements (sales, restocks, adjustments)
    - Record timestamps and reasons for changes
    - Link to products and orders

  3. Security
    - RLS policies for merchant access only
*/

-- Add stock management columns to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'track_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN track_stock boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'total_sales'
  ) THEN
    ALTER TABLE products ADD COLUMN total_sales integer DEFAULT 0;
  END IF;
END $$;

-- Create stock history table
CREATE TABLE IF NOT EXISTS stock_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return')),
  quantity_change integer NOT NULL,
  quantity_after integer NOT NULL,
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Policies for stock_history
DROP POLICY IF EXISTS "Merchants can view own stock history" ON stock_history;
CREATE POLICY "Merchants can view own stock history"
  ON stock_history FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants can insert stock history" ON stock_history;
CREATE POLICY "Merchants can insert stock history"
  ON stock_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_merchant_id ON stock_history(merchant_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created_at ON stock_history(created_at DESC);

-- Function to update stock when order is completed
CREATE OR REPLACE FUNCTION update_product_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when order status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update stock for each item in the order
    DECLARE
      item JSONB;
      product_record RECORD;
    BEGIN
      FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        -- Get current product info
        SELECT * INTO product_record
        FROM products
        WHERE id = (item->>'product_id')::uuid AND track_stock = true;

        IF FOUND THEN
          -- Update product stock and total sales
          UPDATE products
          SET 
            stock_quantity = GREATEST(0, stock_quantity - (item->>'quantity')::integer),
            total_sales = total_sales + (item->>'quantity')::integer
          WHERE id = (item->>'product_id')::uuid;

          -- Record stock history
          INSERT INTO stock_history (
            product_id,
            merchant_id,
            order_id,
            movement_type,
            quantity_change,
            quantity_after,
            reason
          ) VALUES (
            (item->>'product_id')::uuid,
            NEW.merchant_id,
            NEW.id,
            'sale',
            -(item->>'quantity')::integer,
            GREATEST(0, product_record.stock_quantity - (item->>'quantity')::integer),
            'Order completed'
          );
        END IF;
      END LOOP;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_update_stock_on_order ON orders;
CREATE TRIGGER trigger_update_stock_on_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_on_order();
