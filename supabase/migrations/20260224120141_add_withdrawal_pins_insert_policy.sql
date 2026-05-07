/*
  # Add INSERT policy for withdrawal_pins

  ## Overview
  Allows authenticated merchants to create their own withdrawal PIN.

  ## Changes
  - Add INSERT policy to withdrawal_pins table for authenticated users
  - Merchants can only create PINs for themselves
  
  ## Security
  - Users can only insert their own PIN (merchant_id must match their auth_id)
  - Prevents users from creating PINs for other merchants
*/

-- Add INSERT policy for withdrawal_pins
CREATE POLICY "Merchants can create own PIN"
  ON withdrawal_pins FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Add UPDATE policy for withdrawal_pins
CREATE POLICY "Merchants can update own PIN"
  ON withdrawal_pins FOR UPDATE
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