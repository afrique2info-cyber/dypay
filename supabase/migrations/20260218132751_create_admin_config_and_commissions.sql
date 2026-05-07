/*
  # Create Admin Configuration and Commission System

  1. New Tables
    - `admin_config`
      - Stores global Dypay configuration including master Monetbil keys
      - Only accessible by admins
      - Stores commission rates and payment processing settings
    
    - `payment_commissions`
      - Tracks commission earned by Dypay on each transaction
      - Links to payments table
      - Records commission amount and percentage

  2. Security
    - Enable RLS on both tables
    - admin_config: No public access (admin only via service role)
    - payment_commissions: Readable by merchants for their own transactions

  3. Changes
    - Remove need for merchants to configure Monetbil keys
    - All payments processed through Dypay's master account
*/

-- Create admin_config table
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Admin config is not accessible to regular users (admin only via service role)
CREATE POLICY "Admin config not accessible to users"
  ON admin_config
  FOR ALL
  TO authenticated
  USING (false);

-- Create payment_commissions table
CREATE TABLE IF NOT EXISTS payment_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  transaction_amount numeric(10,2) NOT NULL,
  commission_percentage numeric(5,2) NOT NULL DEFAULT 2.50,
  commission_amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_commissions ENABLE ROW LEVEL SECURITY;

-- Merchants can view their own commission records
CREATE POLICY "Merchants can view own commissions"
  ON payment_commissions
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Insert default admin configuration
INSERT INTO admin_config (config_key, config_value, description, is_active)
VALUES 
  ('monetbil_service_key', 'your_master_monetbil_key_here', 'Master Monetbil Service Key for all payment processing', true),
  ('commission_rate', '2.50', 'Default commission rate percentage charged to merchants', true),
  ('min_transaction_amount', '100', 'Minimum transaction amount in XAF', true),
  ('max_transaction_amount', '5000000', 'Maximum transaction amount in XAF', true)
ON CONFLICT (config_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_commissions_merchant ON payment_commissions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_commissions_payment ON payment_commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_admin_config_key ON admin_config(config_key);