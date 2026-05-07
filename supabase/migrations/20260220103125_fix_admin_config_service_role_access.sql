/*
  # Fix Service Role Access to Admin Config

  1. Changes
    - Drop all existing restrictive policies on admin_config
    - Create a single permissive policy that allows service role access
    - Uses auth.jwt() to detect service role context
  
  2. Security
    - Only accessible when using service_role key (Edge Functions)
    - Regular authenticated users still cannot access
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin config not accessible to users" ON admin_config;
DROP POLICY IF EXISTS "Allow service role to read admin config" ON admin_config;
DROP POLICY IF EXISTS "Only service role can access config" ON admin_config;

-- Create a policy that allows access when using service_role key
-- Service role bypasses RLS, so we need to check if role claim exists
CREATE POLICY "Service role can read config"
  ON admin_config
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    current_setting('role') = 'service_role'
  );

-- Block all other access explicitly
CREATE POLICY "Block regular user access"
  ON admin_config
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);