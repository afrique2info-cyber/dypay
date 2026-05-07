/*
  # Add Currency and Multi-Country Support to Shops

  1. Changes
    - Add `currency` column to shops table (default: XAF for Cameroon)
    - Add `supported_countries` column to shops table to allow selling in multiple countries
    - Add `payment_settings` column for advanced payment configuration
    
  2. Details
    - currency: The default currency for the shop (XAF, XOF, CDF, LRD, UGX, GNF)
    - supported_countries: Array of country codes where the shop can sell (CM, SN, CD, etc.)
    - payment_settings: JSONB for storing additional payment configuration
    
  3. Important Notes
    - Existing shops will default to XAF currency and Cameroon (CM)
    - Shops can now accept payments from multiple African countries supported by Dypay/Monetbil
*/

-- Add currency column to shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'currency'
  ) THEN
    ALTER TABLE shops ADD COLUMN currency text DEFAULT 'XAF' NOT NULL;
  END IF;
END $$;

-- Add supported_countries column to shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'supported_countries'
  ) THEN
    ALTER TABLE shops ADD COLUMN supported_countries jsonb DEFAULT '["CM"]'::jsonb NOT NULL;
  END IF;
END $$;

-- Add payment_settings column to shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'payment_settings'
  ) THEN
    ALTER TABLE shops ADD COLUMN payment_settings jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add check constraint for valid currencies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'shops_currency_check'
  ) THEN
    ALTER TABLE shops ADD CONSTRAINT shops_currency_check 
      CHECK (currency IN ('XAF', 'XOF', 'CDF', 'LRD', 'UGX', 'GNF'));
  END IF;
END $$;