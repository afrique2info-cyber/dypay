import { supabase } from './supabase';

export type BlockType =
  | 'hero'
  | 'products-grid'
  | 'features'
  | 'text-content'
  | 'image'
  | 'testimonials'
  | 'cta'
  | 'spacer';

export interface PageBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
  };
  order: number;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface ShopPageConfig {
  id: string;
  shop_id: string;
  blocks: PageBlock[];
  theme_settings: ThemeSettings;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter',
};

export const DEFAULT_BLOCKS: PageBlock[] = [
  {
    id: 'hero-1',
    type: 'hero',
    order: 0,
    content: {
      title: 'Bienvenue dans notre boutique',
      subtitle: 'Découvrez nos produits exceptionnels',
      buttonText: 'Voir nos produits',
      buttonLink: '#products',
      backgroundImage: '',
    },
    style: {
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      padding: '80px 20px',
    },
  },
  {
    id: 'products-1',
    type: 'products-grid',
    order: 1,
    content: {
      title: 'Nos Produits',
      description: 'Parcourez notre sélection de produits',
      columns: 3,
      showCategory: true,
      showPrice: true,
    },
    style: {
      padding: '60px 20px',
    },
  },
  {
    id: 'features-1',
    type: 'features',
    order: 2,
    content: {
      title: 'Pourquoi nous choisir',
      features: [
        {
          icon: 'ShieldCheck',
          title: 'Paiement Sécurisé',
          description: 'Transactions 100% sécurisées',
        },
        {
          icon: 'Truck',
          title: 'Livraison Rapide',
          description: 'Livraison gratuite partout',
        },
        {
          icon: 'Headphones',
          title: 'Support 24/7',
          description: 'Assistance clientèle disponible',
        },
      ],
    },
    style: {
      backgroundColor: '#F9FAFB',
      padding: '60px 20px',
    },
  },
  {
    id: 'cta-1',
    type: 'cta',
    order: 3,
    content: {
      title: 'Prêt à commander?',
      description: 'Commencez vos achats dès maintenant',
      buttonText: 'Parcourir le catalogue',
      buttonLink: '#products',
    },
    style: {
      backgroundColor: '#1E40AF',
      textColor: '#FFFFFF',
      padding: '60px 20px',
    },
  },
];

export async function getShopPageConfig(shopId: string): Promise<ShopPageConfig | null> {
  try {
    const { data, error } = await supabase
      .from('shop_page_configs')
      .select('*')
      .eq('shop_id', shopId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching shop page config:', error);
    return null;
  }
}

export async function createShopPageConfig(
  shopId: string,
  blocks: PageBlock[] = DEFAULT_BLOCKS,
  themeSettings: ThemeSettings = DEFAULT_THEME
): Promise<ShopPageConfig | null> {
  try {
    const { data, error } = await supabase
      .from('shop_page_configs')
      .insert({
        shop_id: shopId,
        blocks,
        theme_settings: themeSettings,
        is_published: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating shop page config:', error);
    return null;
  }
}

export async function updateShopPageConfig(
  shopId: string,
  updates: Partial<Omit<ShopPageConfig, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>
): Promise<ShopPageConfig | null> {
  try {
    const { data, error } = await supabase
      .from('shop_page_configs')
      .update(updates)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating shop page config:', error);
    return null;
  }
}

export async function publishShopPageConfig(shopId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shop_page_configs')
      .update({ is_published: true })
      .eq('shop_id', shopId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error publishing shop page config:', error);
    return false;
  }
}

export async function unpublishShopPageConfig(shopId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shop_page_configs')
      .update({ is_published: false })
      .eq('shop_id', shopId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unpublishing shop page config:', error);
    return false;
  }
}

export function moveBlock(blocks: PageBlock[], fromIndex: number, toIndex: number): PageBlock[] {
  const result = Array.from(blocks);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  return result.map((block, index) => ({
    ...block,
    order: index,
  }));
}

export function addBlock(blocks: PageBlock[], block: PageBlock, position?: number): PageBlock[] {
  const newBlocks = Array.from(blocks);
  const insertPosition = position !== undefined ? position : newBlocks.length;

  newBlocks.splice(insertPosition, 0, {
    ...block,
    order: insertPosition,
  });

  return newBlocks.map((b, index) => ({
    ...b,
    order: index,
  }));
}

export function removeBlock(blocks: PageBlock[], blockId: string): PageBlock[] {
  return blocks
    .filter(b => b.id !== blockId)
    .map((b, index) => ({
      ...b,
      order: index,
    }));
}

export function duplicateBlock(blocks: PageBlock[], blockId: string): PageBlock[] {
  const blockIndex = blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return blocks;

  const blockToDuplicate = blocks[blockIndex];
  const newBlock: PageBlock = {
    ...blockToDuplicate,
    id: `${blockToDuplicate.type}-${Date.now()}`,
  };

  return addBlock(blocks, newBlock, blockIndex + 1);
}
