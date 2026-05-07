import { supabase } from './supabase';

export interface Order {
  id: string;
  merchant_id: string;
  shop_id?: string;
  user_id?: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: any;
  items: any[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_id?: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function createOrder(orderData: Partial<Order>) {
  const orderWithNumber = {
    ...orderData,
    order_number: generateOrderNumber(),
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderWithNumber])
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export async function getMerchantOrders(merchantId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}
