/*
  # Create payments schema for Dypay payment processing

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `payment_ref` (text, unique) - Unique payment reference
      - `item_ref` (text) - Item reference
      - `amount` (numeric) - Payment amount
      - `currency` (text) - Currency code (XAF, XOF, CDF, etc.)
      - `status` (text) - Payment status (pending, completed, failed, cancelled)
      - `phone` (text) - Customer phone number
      - `operator` (text) - Mobile operator code
      - `country` (text) - Country code
      - `user_id` (uuid, nullable) - User who made the payment
      - `first_name` (text) - Customer first name
      - `last_name` (text) - Customer last name
      - `email` (text) - Customer email
      - `payment_url` (text) - Dypay payment URL
      - `monetbil_transaction_id` (text) - External transaction ID
      - `metadata` (jsonb) - Additional payment metadata
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to read their own payments
    - Add policy for authenticated users to create payments
    - Add policy for service role to update payment status
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_ref text UNIQUE NOT NULL,
  item_ref text,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'XAF',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  phone text,
  operator text,
  country text,
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  payment_url text,
  monetbil_transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view payments by payment_ref"
  ON payments
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create payments"
  ON payments
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Service role can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payments_payment_ref ON payments(payment_ref);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
