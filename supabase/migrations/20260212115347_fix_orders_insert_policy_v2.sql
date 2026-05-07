/*
  # Fix Orders Insert Policy - Version 2

  ## Summary
  Complete reset of INSERT policies for the orders table to resolve RLS violations.

  ## Problem
  Users are still getting "new row violates row-level security policy" errors when creating orders.
  This indicates that the current policies are not being applied correctly.

  ## Solution
  1. Drop ALL existing INSERT policies on orders table
  2. Create new comprehensive policies for both anon and authenticated roles
  3. Ensure policies are PERMISSIVE with no restrictions

  ## Security
  - Both anon and authenticated users can create orders (required for checkout)
  - Foreign key constraints ensure merchant_id validity
  - Payment verification happens separately through Monetbil webhook
*/

-- Drop all existing INSERT policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
    DROP POLICY IF EXISTS "Anonymous users can create orders" ON orders;
    DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
    DROP POLICY IF EXISTS "Public can create orders" ON orders;
END $$;

-- Create INSERT policy for anonymous (non-authenticated) users
CREATE POLICY "anon_insert_orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated users
CREATE POLICY "authenticated_insert_orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
