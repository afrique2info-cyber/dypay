/*
  # Remove Duplicate Merchant Creation Trigger

  1. Changes
    - Drop old trigger `on_auth_user_created` and its function
    - Keep only `on_auth_user_created_merchant` which handles account types
  
  2. Reason
    - Two triggers were trying to insert into merchants table
    - This caused duplicate key violations and signup failures
    - The newer trigger handles both merchant and POS account types
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();