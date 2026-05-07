import { supabase } from './supabase';

function generateApiKey(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = prefix + '_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function createApiKey(merchantId: string, keyName: string, isLive: boolean = false) {
  const apiKey = generateApiKey(isLive ? 'live' : 'test');
  const apiSecret = generateApiKey('secret');

  const { data, error } = await supabase.from('api_keys').insert({
    merchant_id: merchantId,
    key_name: keyName,
    api_key: apiKey,
    api_secret: apiSecret,
    is_live: isLive,
  }).select().single();

  if (error) return { error };

  return { data };
}

export async function getMerchantApiKeys(merchantId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_name, api_key, is_live, last_used_at, created_at')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getApiKeySecret(keyId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('api_secret')
    .eq('id', keyId)
    .single();

  return { data, error };
}

export async function revokeApiKey(keyId: string) {
  const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
  return { error };
}

export async function getDypayMasterKey() {
  const { data, error } = await supabase
    .from('admin_config')
    .select('config_value')
    .eq('config_key', 'monetbil_service_key')
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Service de paiement temporairement indisponible');
  }

  return data.config_value;
}

export async function getCommissionRate() {
  const { data } = await supabase
    .from('admin_config')
    .select('config_value')
    .eq('config_key', 'commission_rate')
    .eq('is_active', true)
    .maybeSingle();

  return parseFloat(data?.config_value || '2.50');
}
