/*
  # Create POS Transactions Table

  1. New Tables
    - `pos_transactions`
      - `id` (uuid, primary key)
      - `merchant_id` (uuid, foreign key to merchants)
      - `operator` (text) - Mobile money operator code
      - `amount` (numeric) - Transaction amount
      - `currency` (text) - Transaction currency
      - `phone_number` (text) - Customer phone number
      - `status` (text) - Transaction status: pending, success, failed
      - `payment_ref` (text) - External payment reference
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
  
  2. Security
    - Enable RLS on `pos_transactions` table
    - Add policy for merchants to view their own transactions
    - Add policy for merchants to create transactions
*/

CREATE TABLE IF NOT EXISTS pos_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  operator text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'XAF',
  phone_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payment_ref text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own POS transactions"
  ON pos_transactions
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can create POS transactions"
  ON pos_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update own POS transactions"
  ON pos_transactions
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

CREATE INDEX IF NOT EXISTS idx_pos_transactions_merchant ON pos_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_status ON pos_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at DESC);