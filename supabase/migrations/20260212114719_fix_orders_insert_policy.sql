/*
  # Fix Orders Insert Policy for Public Access

  ## Summary
  This migration fixes the Row Level Security (RLS) policy for inserting orders to allow both authenticated and anonymous users to create orders during checkout.

  ## Problem
  The existing policy uses `TO public` which doesn't work correctly with Supabase's authentication system. Supabase uses two roles:
  - `anon` - for non-authenticated users (guest checkout)
  - `authenticated` - for logged-in users

  ## Changes
  1. Drop the existing "Anyone can create orders" policy
  2. Create separate policies for anonymous and authenticated users
  3. Both policies allow order creation with minimal restrictions (anyone can checkout)

  ## Security Notes
  - Orders require valid merchant_id (foreign key constraint ensures validity)
  - Order validation happens at application level before reaching database
  - Payment verification occurs through separate payment flow
*/

-- Drop the old policy that uses public role
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Allow anonymous users (guest checkout) to create orders
CREATE POLICY "Anonymous users can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);
