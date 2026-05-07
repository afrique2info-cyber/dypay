import { supabase } from './supabase';

export interface Withdrawal {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  monetbil_transaction_id?: string;
  fees: number;
  net_amount: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface MerchantBalance {
  id: string;
  merchant_id: string;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
  currency: string;
  last_withdrawal_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalPin {
  id: string;
  merchant_id: string;
  is_active: boolean;
  failed_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  merchant_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  pin: string;
}

export interface WithdrawalResponse {
  success: boolean;
  message?: string;
  error?: string;
  withdrawal_id?: string;
  transaction_id?: string;
  amount?: number;
  fees?: number;
  net_amount?: number;
  new_balance?: number;
}

export async function getMerchantBalance(merchantId: string): Promise<MerchantBalance | null> {
  const { data, error } = await supabase
    .from('merchant_balances')
    .select('*')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching merchant balance:', error);
    return null;
  }

  return data;
}

export async function getWithdrawalHistory(merchantId: string, limit = 50): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching withdrawal history:', error);
    return [];
  }

  return data || [];
}

export async function checkPinStatus(merchantId: string): Promise<WithdrawalPin | null> {
  const { data, error } = await supabase
    .from('withdrawal_pins')
    .select('id, merchant_id, is_active, failed_attempts, locked_until, created_at, updated_at')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  if (error) {
    console.error('Error checking PIN status:', error);
    return null;
  }

  return data;
}

export async function createWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/process-withdrawal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process withdrawal',
    };
  }
}

export async function setupPin(merchantId: string, pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return {
        success: false,
        error: 'PIN must be exactly 4 digits',
      };
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const existingPin = await checkPinStatus(merchantId);

    if (existingPin) {
      const { error } = await supabase
        .from('withdrawal_pins')
        .update({
          pin_hash: pinHash,
          is_active: true,
          failed_attempts: 0,
          locked_until: null,
        })
        .eq('merchant_id', merchantId);

      if (error) {
        console.error('Error updating PIN:', error);
        return {
          success: false,
          error: 'Failed to update PIN',
        };
      }
    } else {
      const { error } = await supabase
        .from('withdrawal_pins')
        .insert({
          merchant_id: merchantId,
          pin_hash: pinHash,
          is_active: true,
          failed_attempts: 0,
        });

      if (error) {
        console.error('Error creating PIN:', error);
        return {
          success: false,
          error: 'Failed to create PIN',
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting up PIN:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to setup PIN',
    };
  }
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'FCFA',
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    GHS: 'GH₵',
    KES: 'KSh',
    TZS: 'TSh',
    UGX: 'USh',
    ZAR: 'R',
    MAD: 'MAD',
    EGP: 'E£',
  };

  const symbol = symbols[currency] || currency;
  return `${amount.toLocaleString()} ${symbol}`;
}
