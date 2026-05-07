import { supabase } from './supabase';
import { getCurrentMerchant } from './auth';

export interface Shop {
  id: string;
  merchant_id: string;
  shop_name: string;
  shop_slug: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country: string;
  currency: string;
  supported_countries: string[];
  accept_all_countries: boolean;
  website_url?: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  theme_settings: {
    primaryColor: string;
    secondaryColor: string;
  };
  theme_id?: string | null;
  custom_theme_config?: {
    images?: {
      hero?: string;
      banner?: string;
      logo?: string;
    };
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CreateShopData {
  shop_name: string;
  shop_slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  supported_countries?: string[];
  accept_all_countries?: boolean;
  website_url?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  theme_settings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface UpdateShopData extends Partial<CreateShopData> {
  is_active?: boolean;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .eq('shop_slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return !data;
}

export async function createShop(shopData: CreateShopData): Promise<Shop> {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    throw new Error('Merchant not found');
  }

  const isAvailable = await isSlugAvailable(shopData.shop_slug);
  if (!isAvailable) {
    throw new Error('Ce nom de boutique est déjà utilisé. Veuillez en choisir un autre.');
  }

  const { data, error } = await supabase
    .from('shops')
    .insert({
      merchant_id: merchant.id,
      shop_name: shopData.shop_name,
      shop_slug: shopData.shop_slug,
      description: shopData.description || '',
      logo_url: shopData.logo_url,
      banner_url: shopData.banner_url,
      contact_email: shopData.contact_email,
      contact_phone: shopData.contact_phone,
      address: shopData.address,
      city: shopData.city,
      country: shopData.country || 'CM',
      currency: shopData.currency || 'XAF',
      supported_countries: shopData.supported_countries || [shopData.country || 'CM'],
      website_url: shopData.website_url,
      social_media: shopData.social_media || {},
      theme_settings: shopData.theme_settings || {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981'
      }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMerchantShops(): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('shop_slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getShopById(shopId: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', shopId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateShop(
  shopId: string,
  updates: UpdateShopData
): Promise<Shop> {
  if (updates.shop_slug) {
    const currentShop = await getShopById(shopId);
    if (currentShop && currentShop.shop_slug !== updates.shop_slug) {
      const isAvailable = await isSlugAvailable(updates.shop_slug);
      if (!isAvailable) {
        throw new Error('Ce nom de boutique est déjà utilisé.');
      }
    }
  }

  const { data, error } = await supabase
    .from('shops')
    .update(updates)
    .eq('id', shopId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleShopStatus(shopId: string): Promise<void> {
  const shop = await getShopById(shopId);
  if (!shop) throw new Error('Shop not found');

  const { error } = await supabase
    .from('shops')
    .update({ is_active: !shop.is_active })
    .eq('id', shopId);

  if (error) throw error;
}

export async function deleteShop(shopId: string): Promise<void> {
  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', shopId);

  if (error) throw error;
}

export function getShopUrl(slug: string): string {
  return `${window.location.origin}/shop/${slug}`;
}
