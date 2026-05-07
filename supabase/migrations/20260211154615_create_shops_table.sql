/*
  # Create shops table for merchant stores

  1. New Tables
    - `shops`
      - `id` (uuid, primary key) - Unique shop identifier
      - `merchant_id` (uuid, foreign key) - Owner merchant reference
      - `shop_name` (text, required) - Display name of the shop
      - `shop_slug` (text, unique, required) - URL-friendly identifier
      - `description` (text) - Shop description
      - `logo_url` (text) - Logo image URL
      - `banner_url` (text) - Banner/cover image URL
      - `contact_email` (text) - Shop contact email
      - `contact_phone` (text) - Shop contact phone
      - `address` (text) - Physical address
      - `city` (text) - City location
      - `country` (text) - Country code
      - `website_url` (text) - External website
      - `social_media` (jsonb) - Social media links (facebook, twitter, instagram, etc.)
      - `theme_settings` (jsonb) - Customization settings (colors, fonts, etc.)
      - `is_active` (boolean, default true) - Shop status
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `metadata` (jsonb) - Additional data

  2. Security
    - Enable RLS on `shops` table
    - Merchants can view own shops
    - Merchants can create shops
    - Merchants can update own shops
    - Merchants can delete own shops
    - Public can view active shops by slug

  3. Indexes
    - Index on merchant_id for fast lookups
    - Unique index on shop_slug for URL routing
    - Index on is_active for filtering

  4. Important Notes
    - shop_slug must be unique across all shops
    - Default values ensure shops are active by default
    - Social media and theme_settings use JSONB for flexibility
    - All operations verify merchant ownership via auth_id
*/

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  shop_slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  logo_url text,
  banner_url text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  country text DEFAULT 'CM',
  website_url text,
  social_media jsonb DEFAULT '{}',
  theme_settings jsonb DEFAULT '{"primaryColor": "#3B82F6", "secondaryColor": "#10B981"}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shops_merchant_id ON shops(merchant_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(shop_slug);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can view own shops
CREATE POLICY "Merchants can view own shops"
  ON shops
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Public can view active shops by slug
CREATE POLICY "Anyone can view active shops"
  ON shops
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policy: Merchants can create shops
CREATE POLICY "Merchants can create shops"
  ON shops
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Merchants can update own shops
CREATE POLICY "Merchants can update own shops"
  ON shops
  FOR UPDATE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Merchants can delete own shops
CREATE POLICY "Merchants can delete own shops"
  ON shops
  FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS shops_updated_at_trigger ON shops;
CREATE TRIGGER shops_updated_at_trigger
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_shops_updated_at();
