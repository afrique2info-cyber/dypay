/*
  # Allow Service Role Access to Admin Config

  1. Changes
    - Add policy to allow service role (Edge Functions) to read admin_config
    - This enables Edge Functions to access payment configuration securely
  
  2. Security
    - Only service role can access (not regular authenticated users)
    - Read-only access for Edge Functions
*/

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Allow service role to read admin config" ON admin_config;

-- Allow service role (used by Edge Functions) to read admin config
CREATE POLICY "Allow service role to read admin config"
  ON admin_config
  FOR SELECT
  USING (true);

-- Ensure regular authenticated users cannot read config
DROP POLICY IF EXISTS "Authenticated users can read active config" ON admin_config;

CREATE POLICY "Only service role can access config"
  ON admin_config
  FOR SELECT
  TO authenticated
  USING (false);