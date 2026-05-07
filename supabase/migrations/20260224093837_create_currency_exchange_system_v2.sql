/*
  # Currency Exchange System

  1. New Tables
    - `currency_exchange_rates`
      - `id` (uuid, primary key)
      - `base_currency` (text) - Base currency code (e.g., 'XAF')
      - `target_currency` (text) - Target currency code (e.g., 'USD')
      - `rate` (decimal) - Exchange rate
      - `last_updated` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz)
    
    - `supported_currencies`
      - `code` (text, primary key) - Currency code (ISO 4217)
      - `name` (text) - Currency name
      - `symbol` (text) - Currency symbol
      - `countries` (text[]) - Array of country codes using this currency
      - `is_active` (boolean) - Whether this currency is active

  2. Changes to merchants table
    - Add `currency` column to store merchant's preferred currency
    - Add `country` column to store merchant's country

  3. Security
    - Enable RLS on all tables
    - Public read access for currency data
    - Service role only for updates

  4. Initial Data
    - Insert African currencies (XAF, XOF, NGN, GHS, KES, etc.)
    - Insert major international currencies (USD, EUR, GBP)
    - Insert initial exchange rates
*/

-- Create supported_currencies table first
CREATE TABLE IF NOT EXISTS supported_currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  countries text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active currencies"
  ON supported_currencies FOR SELECT
  TO public
  USING (is_active = true);

-- Insert supported currencies BEFORE adding foreign key
INSERT INTO supported_currencies (code, name, symbol, countries) VALUES
  ('XAF', 'Central African CFA Franc', 'FCFA', ARRAY['CM', 'CF', 'TD', 'CG', 'GQ', 'GA']),
  ('XOF', 'West African CFA Franc', 'CFA', ARRAY['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG']),
  ('NGN', 'Nigerian Naira', '₦', ARRAY['NG']),
  ('GHS', 'Ghanaian Cedi', 'GH₵', ARRAY['GH']),
  ('KES', 'Kenyan Shilling', 'KSh', ARRAY['KE']),
  ('TZS', 'Tanzanian Shilling', 'TSh', ARRAY['TZ']),
  ('UGX', 'Ugandan Shilling', 'USh', ARRAY['UG']),
  ('ZAR', 'South African Rand', 'R', ARRAY['ZA']),
  ('MAD', 'Moroccan Dirham', 'MAD', ARRAY['MA']),
  ('EGP', 'Egyptian Pound', 'E£', ARRAY['EG']),
  ('USD', 'US Dollar', '$', ARRAY['US']),
  ('EUR', 'Euro', '€', ARRAY['FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'GR', 'IE']),
  ('GBP', 'British Pound', '£', ARRAY['GB'])
ON CONFLICT (code) DO NOTHING;

-- Create currency_exchange_rates table
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL REFERENCES supported_currencies(code),
  target_currency text NOT NULL REFERENCES supported_currencies(code),
  rate decimal(20, 8) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

ALTER TABLE currency_exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange rates"
  ON currency_exchange_rates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage exchange rates"
  ON currency_exchange_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Now add currency and country to merchants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'currency'
  ) THEN
    ALTER TABLE merchants ADD COLUMN currency text DEFAULT 'XAF' REFERENCES supported_currencies(code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'country'
  ) THEN
    ALTER TABLE merchants ADD COLUMN country text DEFAULT 'CM';
  END IF;
END $$;

-- Insert initial exchange rates (base currency: XAF)
INSERT INTO currency_exchange_rates (base_currency, target_currency, rate) VALUES
  ('XAF', 'XAF', 1.00000000),
  ('XAF', 'XOF', 1.00000000),
  ('XAF', 'USD', 0.00165000),
  ('XAF', 'EUR', 0.00152000),
  ('XAF', 'GBP', 0.00131000),
  ('XAF', 'NGN', 1.35000000),
  ('XAF', 'GHS', 0.02000000),
  ('XAF', 'KES', 0.21300000),
  ('XAF', 'TZS', 3.85000000),
  ('XAF', 'UGX', 6.10000000),
  ('XAF', 'ZAR', 0.03000000),
  ('XAF', 'MAD', 0.01650000),
  ('XAF', 'EGP', 0.05100000),
  
  -- Reverse rates for convenience
  ('USD', 'XAF', 606.00000000),
  ('EUR', 'XAF', 658.00000000),
  ('GBP', 'XAF', 763.00000000),
  ('NGN', 'XAF', 0.74000000),
  ('GHS', 'XAF', 50.00000000),
  ('KES', 'XAF', 4.69500000),
  ('TZS', 'XAF', 0.26000000),
  ('UGX', 'XAF', 0.16400000),
  ('ZAR', 'XAF', 33.33000000),
  ('MAD', 'XAF', 60.60000000),
  ('EGP', 'XAF', 19.60000000)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup 
  ON currency_exchange_rates(base_currency, target_currency);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_updated 
  ON currency_exchange_rates(last_updated DESC);