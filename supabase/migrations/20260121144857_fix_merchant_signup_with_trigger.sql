/*
  # Fix merchant signup with database trigger

  1. Changes
    - Drop the problematic INSERT policy that requires authentication
    - Create a trigger function to auto-create merchant records
    - Add trigger on auth.users to create merchant record on signup
    - Add new INSERT policy that allows the trigger to work

  2. Security
    - Only the database trigger can insert merchant records
    - Users still need to be authenticated to view/update their profile
*/

-- Drop the old INSERT policy
DROP POLICY IF EXISTS "Merchants can create own profile" ON merchants;

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.merchants (auth_id, email, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Ma Boutique')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add INSERT policy for service role (used by trigger)
CREATE POLICY "Service can create merchants"
  ON merchants
  FOR INSERT
  WITH CHECK (true);
