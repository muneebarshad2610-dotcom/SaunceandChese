import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CartItem, MenuItem, AddonItem, AddToCartOptions, CartAddon } from '../types';
import { EXTRA_CHEESE_PRICE, DRINK_OPTIONS } from '../types';

const STORAGE_KEY = 'snc_cart';

function buildAddons(options: AddToCartOptions): CartAddon[] {
  const result: CartAddon[] = [];
  if (options.extraCheese) {
    result.push({ name: 'Extra Cheese', price: EXTRA_CHEESE_PRICE, type: 'extra_cheese' });
  }
  result.push({ name: options.sauce, price: 0, type: 'sauce' });
  if (options.drink) {
    const drinkInfo = DRINK_OPTIONS.find((d) => d.name === options.drink);
    if (drinkInfo) {
      result.push({ name: drinkInfo.name, price: drinkInfo.price, type: 'drink' });
    }
  }
  return result;
}

function migrateCartItem(item: any): CartItem {
  // Handle old format: { price, customCheese, customSauceType } → { unitPrice, addons }
  if ('unitPrice' in item && 'addons' in item) return item as CartItem;
  return {
    id: item.id,
    name: item.name,
    unitPrice: item.price ?? item.unitPrice ?? 0,
    qty: item.qty,
    selectedSize: item.selectedSize,
    image: item.image,
    addons: item.addons ?? [],
  };
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(migrateCartItem);
      }
    } catch {
      // ignore parse errors, start fresh
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartItemCount = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.qty, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, curr) => {
      const addonCost = (curr.addons ?? []).reduce((a, ad) => a + ad.price, 0);
      return acc + ((curr.unitPrice ?? 0) + addonCost) * curr.qty;
    }, 0),
    [cart]
  );

  const addToCart = useCallback(
    (item: MenuItem, options: AddToCartOptions) => {
      const itemPrice = item.prices
        ? item.prices[options.size ?? 'small']
        : item.price;

      const size = item.prices ? options.size : undefined;
      const addons = buildAddons(options);

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (c) =>
            c.id === item.id &&
            c.selectedSize === size &&
            JSON.stringify(c.addons) === JSON.stringify(addons)
        );

        const next = [...prev];
        if (existingIndex > -1) {
          next[existingIndex] = {
            ...next[existingIndex],
            qty: next[existingIndex].qty + options.qty,
          };
        } else {
          next.push({
            id: item.id,
            name: item.name,
            unitPrice: itemPrice,
            qty: options.qty,
            selectedSize: size,
            image: item.image,
            addons,
          });
        }
        return next;
      });
    },
    []
  );

  const quickAddToCart = useCallback(
    (item: MenuItem) => {
      addToCart(item, {
        qty: 1,
        size: item.prices ? 'small' : undefined,
        extraCheese: false,
        sauce: 'Ketchup',
        drink: '',
      });
    },
    [addToCart]
  );

  const adjustQty = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = { ...next[index], qty: next[index].qty + delta };
      if (next[index].qty <= 0) {
        next.splice(index, 1);
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Add a standalone addon item (drink, sauce, extra) directly to cart
  const addAddonToCart = useCallback((addon: AddonItem) => {
    const addonImage = addon.type === 'drink'
      ? 'https://images.unsplash.com/photo-1552539615-7eec9b2d1814?q=80&w=100&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1623689046284-9f1e9f32a6c6?q=80&w=100&auto=format&fit=crop';

    const cartItem: CartItem = {
      id: 10000 + addon.id, // offset to avoid ID collision with menu items
      name: addon.name,
      unitPrice: addon.price,
      qty: 1,
      image: addonImage,
      addons: [],
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.id === cartItem.id && JSON.stringify(c.addons) === '[]'
      );
      const next = [...prev];
      if (existingIndex > -1) {
        next[existingIndex] = {
          ...next[existingIndex],
          qty: next[existingIndex].qty + 1,
        };
      } else {
        next.push(cartItem);
      }
      return next;
    });
  }, []);

  return {
    cart,
    cartItemCount,
    cartSubtotal,
    addToCart,
    quickAddToCart,
    addAddonToCart,
    adjustQty,
    removeItem,
    clearCart,
  } as const;
}
