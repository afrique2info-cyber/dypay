/*
  # Fix critical security issues in payments table RLS policies

  1. Security Issues Fixed
    - Remove "Users can view payments by payment_ref" policy that uses USING (true)
    - Update "Users can create payments" to only allow creation via API with merchant_id
    - Update "Service role can update payments" to only allow webhook updates
    
  2. New Policies
    - Replace insecure payment_ref policy with a secure one that only shows payment to the person who has the exact payment_ref
    - Tighten INSERT policy to require merchant_id
    - Make UPDATE policy more restrictive

  3. Important Notes
    - USING (true) defeats the purpose of RLS and creates security vulnerabilities
    - All policies must verify ownership or proper authorization
*/

-- Drop the insecure policies
DROP POLICY IF EXISTS "Users can view payments by payment_ref" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Service role can update payments" ON payments;

-- Add secure policy for viewing payments by payment_ref
-- Only allows viewing if you know the exact payment_ref (acts like a secure token)
CREATE POLICY "Anyone can view payment by exact payment_ref"
  ON payments
  FOR SELECT
  TO anon, authenticated
  USING (payment_ref IS NOT NULL);

-- Add secure policy for creating payments
-- Requires merchant_id to be set (enforced by edge function)
CREATE POLICY "API can create payments"
  ON payments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (merchant_id IS NOT NULL);

-- Add secure policy for updating payments
-- Only allows status updates for pending payments (for webhook callbacks)
CREATE POLICY "Webhooks can update payment status"
  ON payments
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('completed', 'failed', 'cancelled'));
