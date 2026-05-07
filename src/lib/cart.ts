import { supabase } from './supabase';
import { calculateTotalWithFees } from './service-fees';

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: any;
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export async function getCartItems() {
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `);

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    const sessionId = getSessionId();
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(productId: string, quantity: number = 1) {
  const { data: { user } } = await supabase.auth.getUser();

  const existingItems = await getCartItems();
  const existingItem = existingItems.find(item => item.product_id === productId);

  if (existingItem) {
    return updateCartItem(existingItem.id, existingItem.quantity + quantity);
  }

  const cartItem: any = {
    product_id: productId,
    quantity,
  };

  if (user) {
    cartItem.user_id = user.id;
  } else {
    cartItem.session_id = getSessionId();
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert([cartItem])
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) throw error;
  return data as CartItem;
}

export async function updateCartItem(id: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(id);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) throw error;
  return data as CartItem;
}

export async function removeFromCart(id: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function clearCart() {
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('cart_items').delete();

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    const sessionId = getSessionId();
    query = query.eq('session_id', sessionId);
  }

  const { error } = await query;
  if (error) throw error;
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
}

export function calculateCartTotalWithFees(items: CartItem[]): {
  subtotal: number;
  serviceFees: number;
  total: number;
} {
  const subtotal = calculateCartTotal(items);
  const total = calculateTotalWithFees(subtotal);
  const serviceFees = total - subtotal;

  return {
    subtotal,
    serviceFees,
    total,
  };
}
