/*
  # Shop Page Builder System

  1. New Tables
    - `shop_page_configs`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key to shops)
      - `blocks` (jsonb) - Array of page blocks with their configuration
      - `theme_settings` (jsonb) - Global theme settings (colors, fonts, etc.)
      - `is_published` (boolean) - Whether the custom design is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `shop_page_configs` table
    - Merchants can read/write their own shop page configs
*/

CREATE TABLE IF NOT EXISTS shop_page_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  blocks jsonb DEFAULT '[]'::jsonb NOT NULL,
  theme_settings jsonb DEFAULT '{
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "fontFamily": "Inter"
  }'::jsonb NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(shop_id)
);

ALTER TABLE shop_page_configs ENABLE ROW LEVEL SECURITY;

-- Merchants can read their own shop page configs
CREATE POLICY "Merchants can view own shop page config"
  ON shop_page_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_page_configs.shop_id
      AND shops.merchant_id = auth.uid()
    )
  );

-- Anyone can view published shop page configs
CREATE POLICY "Anyone can view published shop page configs"
  ON shop_page_configs FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Merchants can insert their own shop page configs
CREATE POLICY "Merchants can create own shop page config"
  ON shop_page_configs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_page_configs.shop_id
      AND shops.merchant_id = auth.uid()
    )
  );

-- Merchants can update their own shop page configs
CREATE POLICY "Merchants can update own shop page config"
  ON shop_page_configs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_page_configs.shop_id
      AND shops.merchant_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_page_configs.shop_id
      AND shops.merchant_id = auth.uid()
    )
  );

-- Merchants can delete their own shop page configs
CREATE POLICY "Merchants can delete own shop page config"
  ON shop_page_configs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_page_configs.shop_id
      AND shops.merchant_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_page_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_shop_page_config_timestamp
  BEFORE UPDATE ON shop_page_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_page_config_updated_at();
