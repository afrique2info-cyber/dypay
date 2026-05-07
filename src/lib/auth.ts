import { supabase } from './supabase';

export async function signUp(
  email: string,
  password: string,
  businessName: string,
  accountType: 'merchant' | 'pos' = 'merchant',
  currency: string = 'XAF',
  country: string = 'CM'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
        account_type: accountType,
        currency: currency,
        country: country,
      },
    },
  });

  if (error) return { error };

  return { data };
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentMerchant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  return merchant;
}
