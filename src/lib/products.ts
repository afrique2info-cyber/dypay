import { supabase } from './supabase';

export interface Product {
  id: string;
  merchant_id: string;
  shop_id?: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  prices?: Record<string, number>;
  image_url?: string;
  images: string[];
  category?: string;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export async function getProducts(filters?: {
  shop_id?: string;
  merchant_id?: string;
  category?: string;
  is_active?: boolean;
}) {
  let query = supabase.from('products').select('*');

  if (filters?.shop_id) {
    query = query.eq('shop_id', filters.shop_id);
  }

  if (filters?.merchant_id) {
    query = query.eq('merchant_id', filters.merchant_id);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function createProduct(product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getMerchantProducts(merchantId: string) {
  return getProducts({ merchant_id: merchantId });
}

export async function getShopProducts(shopId: string) {
  return getProducts({ shop_id: shopId, is_active: true });
}
