/*
  # Add Multi-Currency Pricing to Products

  1. Changes
    - Add `prices` JSONB column to products table for storing prices in multiple currencies
    - The structure will be: {"XAF": 10000, "XOF": 15000, "CDF": 20000, ...}
    - Keep existing `price` column as default/fallback price
    - Keep existing `currency` column to indicate the default currency
    
  2. Details
    - prices: JSONB object containing currency codes as keys and prices as values
    - Products can have prices in multiple currencies based on shop's supported_countries
    - If prices is null or empty, fallback to the default price and currency
    
  3. Important Notes
    - Existing products will continue to work with single currency (price + currency)
    - New products can specify prices for multiple currencies
    - Allows customers to pay in their local currency
*/

-- Add prices column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'prices'
  ) THEN
    ALTER TABLE products ADD COLUMN prices jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment to explain the structure
COMMENT ON COLUMN products.prices IS 'Multi-currency prices as JSON object: {"XAF": 10000, "XOF": 15000, ...}';