import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CartItem, MenuItem, AddToCartOptions } from '../types';

const STORAGE_KEY = 'snc_cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as CartItem[];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    return [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartItemCount = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.qty, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0),
    [cart]
  );

  const itemsInCartCount = useMemo(() => cart.length, [cart]);

  const addToCart = useCallback(
    (item: MenuItem, options: AddToCartOptions) => {
      const itemPrice = item.prices
        ? item.prices[options.size ?? 'small']
        : item.price;

      const size = item.prices ? options.size : undefined;

      const existingIndex = cart.findIndex(
        (c) =>
          c.id === item.id &&
          c.selectedSize === size &&
          c.customCheese === options.cheeseLevel &&
          c.customSauceType === options.sauceType
      );

      setCart((prev) => {
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
            price: itemPrice,
            qty: options.qty,
            selectedSize: size,
            image: item.image,
            customCheese: options.cheeseLevel,
            customSauceType: options.sauceType,
          });
        }
        return next;
      });
    },
    [cart]
  );

  const quickAddToCart = useCallback(
    (item: MenuItem) => {
      addToCart(item, {
        qty: 1,
        size: item.prices ? 'small' : undefined,
        cheeseLevel: item.baseCheese ?? 4,
        sauceType: item.baseSauce ?? 'Liquid Gold',
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

  return {
    cart,
    cartItemCount,
    cartSubtotal,
    itemsInCartCount,
    addToCart,
    quickAddToCart,
    adjustQty,
    removeItem,
    clearCart,
  } as const;
}
