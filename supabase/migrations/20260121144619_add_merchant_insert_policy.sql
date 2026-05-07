/*
  # Add INSERT policy for merchants table

  1. Changes
    - Add INSERT policy to allow authenticated users to create their merchant profile
    - This fixes the "Merchant not found" error during signup

  2. Security
    - Only authenticated users can insert
    - Users can only insert a merchant profile for their own auth_id
*/

CREATE POLICY "Merchants can create own profile"
  ON merchants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);
