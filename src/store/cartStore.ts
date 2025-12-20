import { create } from 'zustand';
import type {
  CartItem,
  CartExtra,
  DishWithDetails,
  Portion,
} from '../db/types';

interface CartState {
  businessId: string;
  userId: string;
  tableName: string;
  customerName: string;
  customerPhone: string;
  internalCart: CartItem[];

  // Actions
  setTableInfo: (
    tableName: string,
    customerName?: string,
    customerPhone?: string,
  ) => void;
  addToCart: (
    dish: DishWithDetails,
    portion: Portion | null,
    extras: CartExtra[],
    quantity?: number,
  ) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Variant management
  getCartItemsForDish: (dishId: number) => CartItem[];
  getTotalQuantityForDish: (dishId: number) => number;
  hasMultipleVariants: (dishId: number) => boolean;
  incrementVariant: (itemId: string) => void;
  decrementVariant: (itemId: string) => void;
  getLastAddedVariant: (dishId: number) => CartItem | null;
}

// Generate unique cart item ID based on dish, portion, and extras
const generateCartItemId = (
  dishId: number,
  portionId: number | null,
  extras: CartExtra[],
): string => {
  if (extras.length === 0) {
    return `${dishId}_${portionId}_no_extras`;
  }

  const extrasString = extras
    .map(extra => `${extra.id}:${extra.quantity}`)
    .sort()
    .join('|');

  return `${dishId}_${portionId}_${extrasString}`;
};

export const useCartStore = create<CartState>()((set, get) => ({
  businessId: '66c0fbcdf04da56982f057a2', // Default business ID
  userId: '',
  tableName: '',
  customerName: '',
  customerPhone: '',
  internalCart: [],

  setTableInfo: (tableName, customerName = '', customerPhone = '') => {
    set({ tableName, customerName, customerPhone });
  },

  addToCart: (dish, portion, extras, quantity = 1) => {
    const cartItemId = generateCartItemId(dish.id, portion?.id ?? null, extras);
    const currentCart = get().internalCart;

    // Check if item already exists
    const existingItemIndex = currentCart.findIndex(
      item => item.id === cartItemId,
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity,
      };
      set({ internalCart: updatedCart });
    } else {
      // Add new item
      const newItem: CartItem = {
        id: cartItemId,
        dish,
        portion,
        extras,
        quantity,
      };
      set({ internalCart: [...currentCart, newItem] });
    }
  },

  updateCartItemQuantity: (itemId, quantity) => {
    const currentCart = get().internalCart;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      set({ internalCart: currentCart.filter(item => item.id !== itemId) });
    } else {
      // Update quantity
      const updatedCart = currentCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item,
      );
      set({ internalCart: updatedCart });
    }
  },

  removeFromCart: itemId => {
    set({
      internalCart: get().internalCart.filter(item => item.id !== itemId),
    });
  },

  clearCart: () => {
    set({ internalCart: [], customerName: '', customerPhone: '' });
  },

  getCartTotal: () => {
    return get().internalCart.reduce((total, item) => {
      const portionPrice = item.portion?.price ?? item.dish.price ?? 0;
      const extrasPrice = item.extras.reduce(
        (sum, extra) => sum + extra.price * extra.quantity,
        0,
      );
      return total + (portionPrice + extrasPrice) * item.quantity;
    }, 0);
  },

  getCartItemCount: () => {
    return get().internalCart.reduce((count, item) => count + item.quantity, 0);
  },

  // Variant management functions
  getCartItemsForDish: (dishId: number) => {
    return get().internalCart.filter(item => item.dish.id === dishId);
  },

  getTotalQuantityForDish: (dishId: number) => {
    const items = get().internalCart.filter(item => item.dish.id === dishId);
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  hasMultipleVariants: (dishId: number) => {
    const items = get().internalCart.filter(item => item.dish.id === dishId);
    return items.length > 1;
  },

  incrementVariant: (itemId: string) => {
    const currentCart = get().internalCart;
    const updatedCart = currentCart.map(item =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
    );
    set({ internalCart: updatedCart });
  },

  decrementVariant: (itemId: string) => {
    const currentCart = get().internalCart;
    const item = currentCart.find(i => i.id === itemId);

    if (!item) return;

    if (item.quantity <= 1) {
      // Remove item if quantity becomes 0
      set({ internalCart: currentCart.filter(i => i.id !== itemId) });
    } else {
      // Decrease quantity
      const updatedCart = currentCart.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
      );
      set({ internalCart: updatedCart });
    }
  },

  getLastAddedVariant: (dishId: number) => {
    const items = get().internalCart.filter(item => item.dish.id === dishId);
    // Return the last item in the array (most recently added)
    return items.length > 0 ? items[items.length - 1] : null;
  },
}));
