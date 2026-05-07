import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCartItems, addToCart as addToCartLib, updateCartItem, removeFromCart, clearCart, type CartItem } from '../lib/cart';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  total: number;
  itemCount: number;
  selectedCurrency: string;
  selectedCountry: string;
  setCartCurrency: (currency: string, country: string) => void;
  addToCart: (productId: string, quantity?: number, currency?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getProductPrice: (product: any, currency?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('XAF');
  const [selectedCountry, setSelectedCountry] = useState<string>('CM');

  const getProductPrice = (product: any, currency?: string): number => {
    const curr = currency || selectedCurrency;
    if (product?.prices && product.prices[curr]) {
      return product.prices[curr];
    }
    return product?.price || 0;
  };

  const refreshCart = async () => {
    try {
      const data = await getCartItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1, currency?: string) => {
    try {
      await addToCartLib(productId, quantity);
      if (currency) {
        setSelectedCurrency(currency);
      }
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clear = async () => {
    try {
      await clearCart();
      await refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const setCartCurrency = (currency: string, country: string) => {
    setSelectedCurrency(currency);
    setSelectedCountry(country);
  };

  const total = items.reduce((sum, item) => {
    const price = getProductPrice(item.product, selectedCurrency);
    return sum + (price * item.quantity);
  }, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        total,
        itemCount,
        selectedCurrency,
        selectedCountry,
        setCartCurrency,
        addToCart,
        updateQuantity,
        removeItem,
        clear,
        refreshCart,
        getProductPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
