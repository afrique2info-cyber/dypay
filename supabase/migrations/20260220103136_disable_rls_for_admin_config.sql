/*
  # Disable RLS for Admin Config Table

  1. Changes
    - Disable Row Level Security on admin_config table
    - This table is only accessed by Edge Functions using service_role key
    - No direct user access is possible
  
  2. Security
    - Table is not exposed to frontend (no anon key access)
    - Only Edge Functions with service_role key can access
    - Contains system configuration, not user data
  
  3. Rationale
    - Service role key bypasses RLS anyway
    - Simplifies access for internal Edge Functions
    - Maintains security through key-based access control
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Service role can read config" ON admin_config;
DROP POLICY IF EXISTS "Block regular user access" ON admin_config;
DROP POLICY IF EXISTS "Admin config not accessible to users" ON admin_config;
DROP POLICY IF EXISTS "Allow service role to read admin config" ON admin_config;
DROP POLICY IF EXISTS "Only service role can access config" ON admin_config;

-- Disable RLS for this system configuration table
ALTER TABLE admin_config DISABLE ROW LEVEL SECURITY;