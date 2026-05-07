/*
  # Add DELETE and UPDATE policies for api_keys table

  1. Changes
    - Add DELETE policy to allow merchants to revoke their own API keys
    - Add UPDATE policy to allow system to update last_used_at and other fields

  2. Security
    - Merchants can only delete their own API keys
    - Merchants can only update their own API keys
    - All operations verify merchant ownership via auth_id

  3. Notes
    - DELETE policy is needed for the revokeApiKey function
    - UPDATE policy is needed for tracking last_used_at timestamps
*/

-- Add DELETE policy for merchants to revoke their own API keys
CREATE POLICY "Merchants can delete own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_id = auth.uid()
    )
  );

-- Add UPDATE policy for updating API key metadata
CREATE POLICY "Merchants can update own API keys"
  ON api_keys
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
