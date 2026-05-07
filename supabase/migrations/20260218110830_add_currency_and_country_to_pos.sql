/*
  # Add Currency and Country Support for POS Accounts

  1. Changes
    - Add `pos_currency` column to merchants table for POS account currency
    - Add `pos_country` column to merchants table for POS account country
    - Update trigger to handle currency and country from signup metadata
  
  2. Purpose
    - Allow POS accounts to select their currency and country during signup
    - Enable multi-currency support for POS terminals
    - Filter available operators based on country selection
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'pos_currency'
  ) THEN
    ALTER TABLE merchants ADD COLUMN pos_currency text DEFAULT 'XAF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'pos_country'
  ) THEN
    ALTER TABLE merchants ADD COLUMN pos_country text DEFAULT 'CM';
  END IF;
END $$;

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
  currency_val text;
  country_val text;
BEGIN
  account_type_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'account_type'), ''),
    'merchant'
  );
  
  business_name_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'business_name'), ''),
    NEW.email
  );

  currency_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'currency'), ''),
    'XAF'
  );

  country_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'country'), ''),
    'CM'
  );

  IF account_type_val = 'pos' THEN
    INSERT INTO public.merchants (
      auth_id, 
      email, 
      business_name, 
      account_type, 
      pos_name,
      pos_currency,
      pos_country
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      business_name_val, 
      'pos'::text, 
      business_name_val,
      currency_val,
      country_val
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

CREATE TRIGGER on_auth_user_created_merchant
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_merchant_user();