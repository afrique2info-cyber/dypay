import { supabase } from './supabase';

export interface VirtualCard {
  id: string;
  merchant_id: string;
  card_number: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  card_type: 'VISA' | 'MASTERCARD';
  status: 'active' | 'blocked' | 'expired';
  balance: number;
  currency: string;
  spending_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  transaction_type: 'debit' | 'credit' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  merchant_name?: string;
  created_at: string;
  metadata?: any;
}

function generateCardNumber(cardType: 'VISA' | 'MASTERCARD'): string {
  const prefix = cardType === 'VISA' ? '4' : '5';
  let cardNumber = prefix;

  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  return cardNumber;
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export async function createVirtualCard(
  cardHolderName: string,
  cardType: 'VISA' | 'MASTERCARD',
  initialBalance: number = 0,
  currency: string = 'XAF',
  spendingLimit?: number
): Promise<VirtualCard> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: merchantData, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (merchantError) throw merchantError;
  if (!merchantData) throw new Error('Merchant not found');

  const cardNumber = generateCardNumber(cardType);
  const cvv = generateCVV();
  const currentYear = new Date().getFullYear();
  const expiryYear = currentYear + 3;
  const expiryMonth = Math.floor(Math.random() * 12) + 1;

  const { data, error } = await supabase
    .from('virtual_cards')
    .insert({
      merchant_id: merchantData.id,
      card_number: cardNumber,
      card_holder_name: cardHolderName,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
      cvv: cvv,
      card_type: cardType,
      status: 'active',
      balance: initialBalance,
      currency: currency,
      spending_limit: spendingLimit,
      is_active: true,
      metadata: {
        created_from: 'web',
        initial_balance: initialBalance
      }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVirtualCards(): Promise<VirtualCard[]> {
  const { data, error } = await supabase
    .from('virtual_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVirtualCard(cardId: string): Promise<VirtualCard | null> {
  const { data, error } = await supabase
    .from('virtual_cards')
    .select('*')
    .eq('id', cardId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateCardStatus(
  cardId: string,
  status: 'active' | 'blocked' | 'expired'
): Promise<void> {
  const { error } = await supabase
    .from('virtual_cards')
    .update({ status, is_active: status === 'active' })
    .eq('id', cardId);

  if (error) throw error;
}

export async function addFundsToCard(
  cardId: string,
  amount: number
): Promise<void> {
  const card = await getVirtualCard(cardId);
  if (!card) throw new Error('Card not found');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: merchantData, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (merchantError) throw merchantError;
  if (!merchantData) throw new Error('Merchant not found');

  const newBalance = card.balance + amount;

  const { error: updateError } = await supabase
    .from('virtual_cards')
    .update({ balance: newBalance })
    .eq('id', cardId);

  if (updateError) throw updateError;

  const { error: transactionError } = await supabase
    .from('card_transactions')
    .insert({
      card_id: cardId,
      merchant_id: merchantData.id,
      amount: amount,
      currency: card.currency,
      transaction_type: 'credit',
      status: 'completed',
      description: 'Rechargement de carte',
      merchant_name: 'Dypay'
    });

  if (transactionError) throw transactionError;
}

export async function getCardTransactions(cardId: string): Promise<CardTransaction[]> {
  const { data, error } = await supabase
    .from('card_transactions')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteVirtualCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('virtual_cards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;
}

export { formatCardNumber };
