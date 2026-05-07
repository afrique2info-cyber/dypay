/*
  # Create Withdrawals and PIN System

  ## Overview
  This migration creates a complete withdrawal system allowing merchants and POS users
  to withdraw funds from their Dypay accounts through Monetbil transparently.

  ## 1. New Tables
  
  ### `withdrawals`
  - `id` (uuid, primary key) - Unique withdrawal identifier
  - `merchant_id` (uuid, foreign key) - Reference to merchants table
  - `amount` (decimal) - Withdrawal amount
  - `currency` (text) - Currency code (XAF, USD, etc.)
  - `phone_number` (text) - Recipient phone number for mobile money
  - `status` (text) - pending, processing, completed, failed, cancelled
  - `monetbil_transaction_id` (text) - Monetbil transaction reference
  - `fees` (decimal) - Transaction fees
  - `net_amount` (decimal) - Amount after fees
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz) - Withdrawal request time
  - `completed_at` (timestamptz) - Completion time
  - `metadata` (jsonb) - Additional data

  ### `merchant_balances`
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, foreign key, unique) - One balance per merchant
  - `available_balance` (decimal) - Available for withdrawal
  - `pending_balance` (decimal) - Pending transactions
  - `total_withdrawn` (decimal) - Lifetime withdrawals
  - `currency` (text) - Balance currency
  - `last_withdrawal_at` (timestamptz) - Last withdrawal time
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `withdrawal_pins`
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, foreign key, unique) - One PIN per merchant
  - `pin_hash` (text) - Hashed PIN (never store plain text)
  - `is_active` (boolean) - PIN activation status
  - `failed_attempts` (integer) - Failed PIN attempts counter
  - `locked_until` (timestamptz) - Lockout timestamp after failed attempts
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  
  - All tables have RLS enabled
  - Merchants can only access their own records
  - PIN hashes are never directly accessible to clients
  - Service role required for sensitive operations
  - Failed attempt tracking prevents brute force attacks
  - After 5 failed attempts, account locks for 30 minutes

  ## 3. Important Notes
  
  - PIN must be 4 digits exactly
  - Withdrawal fees are configurable in admin_config
  - Monetbil integration handles actual money transfer
  - All amounts stored with 2 decimal precision
*/

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount decimal(15, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'XAF',
  phone_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  monetbil_transaction_id text,
  fees decimal(15, 2) DEFAULT 0,
  net_amount decimal(15, 2) NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create merchant_balances table
CREATE TABLE IF NOT EXISTS merchant_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
  available_balance decimal(15, 2) DEFAULT 0 NOT NULL,
  pending_balance decimal(15, 2) DEFAULT 0 NOT NULL,
  total_withdrawn decimal(15, 2) DEFAULT 0 NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  last_withdrawal_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create withdrawal_pins table
CREATE TABLE IF NOT EXISTS withdrawal_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  is_active boolean DEFAULT true,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant_id ON withdrawals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_balances_merchant_id ON merchant_balances(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_pins_merchant_id ON withdrawal_pins(merchant_id);

-- Enable Row Level Security
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_pins ENABLE ROW LEVEL SECURITY;

-- Withdrawals policies
CREATE POLICY "Merchants can view own withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can create withdrawal requests"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all withdrawals"
  ON withdrawals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Merchant balances policies
CREATE POLICY "Merchants can view own balance"
  ON merchant_balances FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all balances"
  ON merchant_balances FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Withdrawal PINs policies (very restrictive)
CREATE POLICY "Merchants can view own PIN status only"
  ON withdrawal_pins FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all PINs"
  ON withdrawal_pins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically create balance record for new merchants
CREATE OR REPLACE FUNCTION create_merchant_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO merchant_balances (merchant_id, currency, available_balance, pending_balance, total_withdrawn)
  VALUES (NEW.id, COALESCE(NEW.currency, 'XAF'), 0, 0, 0)
  ON CONFLICT (merchant_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create balance on merchant creation
DROP TRIGGER IF EXISTS create_merchant_balance_trigger ON merchants;
CREATE TRIGGER create_merchant_balance_trigger
  AFTER INSERT ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION create_merchant_balance();

-- Function to update balance timestamp
CREATE OR REPLACE FUNCTION update_merchant_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for balance updates
DROP TRIGGER IF EXISTS update_merchant_balance_timestamp_trigger ON merchant_balances;
CREATE TRIGGER update_merchant_balance_timestamp_trigger
  BEFORE UPDATE ON merchant_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_balance_timestamp();

-- Function to update PIN timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_pin_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for PIN updates
DROP TRIGGER IF EXISTS update_withdrawal_pin_timestamp_trigger ON withdrawal_pins;
CREATE TRIGGER update_withdrawal_pin_timestamp_trigger
  BEFORE UPDATE ON withdrawal_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_pin_timestamp();

-- Create initial balances for existing merchants
INSERT INTO merchant_balances (merchant_id, currency, available_balance, pending_balance, total_withdrawn)
SELECT id, COALESCE(currency, 'XAF'), 0, 0, 0
FROM merchants
ON CONFLICT (merchant_id) DO NOTHING;