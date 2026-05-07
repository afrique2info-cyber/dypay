/*
  # Update Merchant Creation Trigger for Account Type

  1. Changes
    - Drop existing trigger and function
    - Create new function that handles account_type from metadata
    - Recreate trigger with updated logic
  
  2. Behavior
    - If account_type is 'pos', create merchant with pos_name
    - If account_type is 'merchant', create merchant with business_name
    - Default to 'merchant' type if not specified
*/

DROP TRIGGER IF EXISTS on_auth_user_created_merchant ON auth.users;
DROP FUNCTION IF EXISTS handle_new_merchant_user();

CREATE OR REPLACE FUNCTION handle_new_merchant_user()
RETURNS TRIGGER AS $$
DECLARE
  account_type_val text;
  business_name_val text;
BEGIN
  account_type_val := COALESCE(NEW.raw_user_meta_data->>'account_type', 'merchant');
  business_name_val := COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.email);

  IF account_type_val = 'pos' THEN
    INSERT INTO public.merchants (auth_id, email, business_name, account_type, pos_name)
    VALUES (NEW.id, NEW.email, business_name_val, 'pos', business_name_val);
  ELSE
    INSERT INTO public.merchants (auth_id, email, business_name, account_type)
    VALUES (NEW.id, NEW.email, business_name_val, 'merchant');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_merchant
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_merchant_user();