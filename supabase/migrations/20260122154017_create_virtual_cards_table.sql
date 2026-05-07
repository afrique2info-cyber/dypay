/*
  # Create Virtual Cards System

  ## Overview
  This migration creates the infrastructure for virtual card management, allowing merchants
  to create and manage virtual Visa/Mastercard cards for their customers.

  ## New Tables
  
  ### `virtual_cards`
  Stores virtual card information for merchants and customers
  - `id` (uuid, primary key) - Unique card identifier
  - `merchant_id` (uuid, foreign key) - Reference to the merchant who owns the card
  - `card_number` (text, encrypted) - Virtual card number (last 4 digits stored for display)
  - `card_holder_name` (text) - Name on the card
  - `expiry_month` (integer) - Card expiration month (1-12)
  - `expiry_year` (integer) - Card expiration year (YYYY)
  - `cvv` (text, encrypted) - Card CVV (stored encrypted, never fully displayed)
  - `card_type` (text) - Type of card (VISA or MASTERCARD)
  - `status` (text) - Card status (active, blocked, expired)
  - `balance` (numeric) - Available balance on the card
  - `currency` (text) - Currency code (XAF, USD, EUR, etc.)
  - `spending_limit` (numeric) - Optional spending limit
  - `is_active` (boolean) - Whether the card is currently active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `metadata` (jsonb) - Additional card metadata
  
  ### `card_transactions`
  Tracks all transactions made with virtual cards
  - `id` (uuid, primary key) - Transaction identifier
  - `card_id` (uuid, foreign key) - Reference to the virtual card
  - `merchant_id` (uuid, foreign key) - Reference to the merchant
  - `amount` (numeric) - Transaction amount
  - `currency` (text) - Currency code
  - `transaction_type` (text) - Type (debit, credit, refund)
  - `status` (text) - Transaction status (pending, completed, failed)
  - `description` (text) - Transaction description
  - `merchant_name` (text) - Name of the merchant where transaction occurred
  - `created_at` (timestamptz) - Transaction timestamp
  - `metadata` (jsonb) - Additional transaction data

  ## Security
  - Enable RLS on both tables
  - Add policies for merchants to manage their own cards
  - Add policies for viewing card transactions
  - Ensure proper authentication checks

  ## Important Notes
  1. Card numbers and CVVs should be encrypted at application level before storage
  2. Only last 4 digits of card number should be displayed in UI
  3. CVV should never be displayed after initial card creation
  4. This is a simulated system - real card issuing requires integration with card processors
*/

-- Create virtual_cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES auth.users(id) NOT NULL,
  card_number text NOT NULL,
  card_holder_name text NOT NULL,
  expiry_month integer NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year integer NOT NULL CHECK (expiry_year >= 2024),
  cvv text NOT NULL,
  card_type text NOT NULL CHECK (card_type IN ('VISA', 'MASTERCARD')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'expired')),
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'XAF',
  spending_limit numeric CHECK (spending_limit >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create card_transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES virtual_cards(id) ON DELETE CASCADE NOT NULL,
  merchant_id uuid REFERENCES auth.users(id) NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'refund')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  merchant_name text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_virtual_cards_merchant_id ON virtual_cards(merchant_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_merchant_id ON card_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_created_at ON card_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_cards

-- Merchants can view their own cards
CREATE POLICY "Merchants can view own virtual cards"
  ON virtual_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

-- Merchants can create their own cards
CREATE POLICY "Merchants can create virtual cards"
  ON virtual_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

-- Merchants can update their own cards
CREATE POLICY "Merchants can update own virtual cards"
  ON virtual_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

-- Merchants can delete their own cards
CREATE POLICY "Merchants can delete own virtual cards"
  ON virtual_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = merchant_id);

-- RLS Policies for card_transactions

-- Merchants can view transactions for their cards
CREATE POLICY "Merchants can view own card transactions"
  ON card_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

-- System can insert transactions (for automated processing)
CREATE POLICY "Merchants can create card transactions"
  ON card_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_virtual_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_virtual_cards_updated_at_trigger ON virtual_cards;
CREATE TRIGGER update_virtual_cards_updated_at_trigger
  BEFORE UPDATE ON virtual_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_virtual_cards_updated_at();
