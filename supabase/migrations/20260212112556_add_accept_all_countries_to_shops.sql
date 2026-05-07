/*
  # Add Multi-Country Payment Support to Shops

  1. Changes
    - Add `accept_all_countries` boolean column to shops table
    - When true, the shop can accept payments from all countries supported by the platform
    - When false, the shop is limited to countries in `supported_countries`
    
  2. Details
    - accept_all_countries: Boolean flag to enable global payment acceptance
    - Default: false (shops remain limited to their specified countries)
    - Merchants can enable this to accept payments from any supported country
    
  3. Security
    - No RLS changes needed (existing policies apply)
*/

-- Add accept_all_countries column to shops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'accept_all_countries'
  ) THEN
    ALTER TABLE shops ADD COLUMN accept_all_countries boolean DEFAULT false NOT NULL;
  END IF;
END $$;
