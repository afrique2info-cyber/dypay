/*
  # Add Account Types to Merchants

  1. Changes
    - Add `account_type` column to merchants table
      - Values: 'merchant' (default) or 'pos'
      - Merchant accounts: full access to all features (shops, products, payment links, etc.)
      - POS accounts: simplified interface for point-of-sale transactions only
    
    - Add `pos_name` column for POS display name
    - Add `pos_location` column for POS physical location
    
  2. Security
    - No changes to RLS policies needed
    - Existing policies will work with both account types
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE merchants ADD COLUMN account_type text DEFAULT 'merchant' CHECK (account_type IN ('merchant', 'pos'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'pos_name'
  ) THEN
    ALTER TABLE merchants ADD COLUMN pos_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'pos_location'
  ) THEN
    ALTER TABLE merchants ADD COLUMN pos_location text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_merchants_account_type ON merchants(account_type);