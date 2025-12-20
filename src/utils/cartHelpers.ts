import type {
  CartItem,
  CartExtra,
  Portion,
  DishWithDetails,
} from '../db/types';

/**
 * Format variant description for display
 * Example: "Regular, Bread 1+2, Extra Sauce"
 */
export const formatVariantDescription = (
  portion: Portion | null,
  extras: CartExtra[],
): string => {
  const parts: string[] = [];

  if (portion) {
    parts.push(portion.name);
  }

  if (extras.length > 0) {
    const extrasText = extras.map(e => `${e.name} (${e.quantity})`).join(', ');
    parts.push(extrasText);
  }

  return parts.length > 0 ? parts.join(', ') : 'Standard';
};

/**
 * Calculate total price for a cart item
 */
export const calculateItemTotal = (item: CartItem): number => {
  const portionPrice = item.portion?.price || 0;
  const extrasPrice = item.extras.reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0,
  );
  return (portionPrice + extrasPrice) * item.quantity;
};

/**
 * Group cart items by dish
 */
export const groupCartItemsByDish = (
  cart: CartItem[],
): Map<number, CartItem[]> => {
  const grouped = new Map<number, CartItem[]>();

  cart.forEach(item => {
    const dishId = item.dish.id;
    if (!grouped.has(dishId)) {
      grouped.set(dishId, []);
    }
    grouped.get(dishId)!.push(item);
  });

  return grouped;
};

/**
 * Get default portion for a dish
 * Returns the portion marked as default, or the first portion if none is default
 */
export const getDefaultPortion = (dish: DishWithDetails): Portion | null => {
  if (!dish.portions || dish.portions.length === 0) {
    return null;
  }

  const defaultPortion = dish.portions.find(p => p.is_default);
  return defaultPortion || dish.portions[0];
};

/**
 * Check if dish has portions or add-ons
 */
export const dishHasVariants = (dish: DishWithDetails): boolean => {
  const hasPortions = dish.portions && dish.portions.length > 0;
  const hasAddOns = dish.addOns && dish.addOns.length > 0;
  return hasPortions || hasAddOns;
};
