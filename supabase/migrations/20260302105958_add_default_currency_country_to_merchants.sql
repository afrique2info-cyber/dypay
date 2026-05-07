/*
  # Ajouter devise et pays par défaut pour tous les marchands

  1. Nouvelles colonnes
    - `default_currency` (text) - Devise par défaut du marchand (XAF, XOF, CDF, etc.)
    - `default_country` (text) - Pays par défaut du marchand (CM, CI, CD, etc.)
  
  2. Modifications
    - Mise à jour du trigger pour enregistrer la devise et le pays lors de l'inscription
    - Les valeurs par défaut sont XAF et CM si non spécifiées
  
  3. Sécurité
    - Aucun changement aux politiques RLS
*/

-- Ajouter les colonnes pour la devise et le pays par défaut
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'default_currency'
  ) THEN
    ALTER TABLE merchants ADD COLUMN default_currency text DEFAULT 'XAF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'default_country'
  ) THEN
    ALTER TABLE merchants ADD COLUMN default_country text DEFAULT 'CM';
  END IF;
END $$;

-- Mettre à jour le trigger pour enregistrer la devise et le pays
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
      pos_country,
      default_currency,
      default_country
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      business_name_val, 
      'pos'::text, 
      business_name_val,
      currency_val,
      country_val,
      currency_val,
      country_val
    );
  ELSE
    INSERT INTO public.merchants (
      auth_id, 
      email, 
      business_name, 
      account_type,
      default_currency,
      default_country
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      business_name_val, 
      'merchant'::text,
      currency_val,
      country_val
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
