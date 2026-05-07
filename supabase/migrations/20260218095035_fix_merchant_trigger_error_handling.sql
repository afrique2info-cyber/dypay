/*
  # Fix Merchant Creation Trigger with Better Error Handling

  1. Changes
    - Drop and recreate trigger function with proper error handling
    - Add exception handling to catch and log errors
    - Ensure proper type casting and null handling
  
  2. Security
    - Function runs as SECURITY DEFINER with proper permissions
*/

DROP TRIGGER IF EXISTS on_auth_user_created_merchant ON auth.users;
DROP FUNCTION IF EXISTS handle_new_merchant_user();

CREATE OR REPLACE FUNCTION handle_new_merchant_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  account_type_val text;
  business_name_val text;
BEGIN
  -- Extract metadata with proper defaults
  account_type_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'account_type'), ''),
    'merchant'
  );
  
  business_name_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'business_name'), ''),
    NEW.email
  );

  -- Insert merchant based on account type
  IF account_type_val = 'pos' THEN
    INSERT INTO public.merchants (
      auth_id, 
      email, 
      business_name, 
      account_type, 
      pos_name
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      business_name_val, 
      'pos'::text, 
      business_name_val
    );
  ELSE
    INSERT INTO public.merchants (
      auth_id, 
      email, 
      business_name, 
      account_type
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      business_name_val, 
      'merchant'::text
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_merchant_user: %, %', SQLERRM, SQLSTATE;
    RAISE EXCEPTION 'Failed to create merchant profile: %', SQLERRM;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created_merchant
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_merchant_user();