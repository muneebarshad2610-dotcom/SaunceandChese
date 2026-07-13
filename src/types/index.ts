export interface ProductVariantOption {
  name: string;
  price: number;
}

export interface ProductVariant {
  name: string;
  required: boolean;
  options: ProductVariantOption[];
}

export interface MenuItem {
  id: number;
  name: string;
  category: 'classic' | 'special' | 'deal';
  productCategory: string;
  price: number;
  prices?: {
    small: number;
    regular: number;
    large: number;
  };
  variants?: ProductVariant[];
  description: string;
  image: string;
}

export interface CartAddon {
  name: string;
  price: number;
  type: 'extra_cheese' | 'sauce' | 'drink';
}

export interface CartItem {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
  selectedSize?: 'small' | 'regular' | 'large';
  selectedVariants?: Record<string, string>;
  image: string;
  addons: CartAddon[];
}

export type OrderStatus = 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderDetails {
  id: string;
  total: number;
  itemsCount: number;
  estimatedDeliveryAt?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  clerkUserId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  items: CartItem[];
  subtotal: number;
  status: OrderStatus;
  tableId: number | null;
  guestName: string | null;
  splitBill: boolean | null;
  sessionToken: string | null;
  estimatedDeliveryAt: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes: string;
}

export interface AddToCartOptions {
  qty: number;
  size?: 'small' | 'regular' | 'large';
  selectedVariants?: Record<string, string>;
  extraCheese: boolean;
  sauce: string;
  drink: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface AddonItem {
  id: number;
  type: 'sauce' | 'drink' | 'extra';
  name: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

// Hardcoded defaults for useCart.ts (sync imports need static values)
export const SAUCE_OPTIONS = ['Ketchup', 'Mayo', 'BBQ Sauce', 'Ranch', 'Garlic Mayo'] as const;
export const DRINK_OPTIONS = [
  { name: 'Pepsi', price: 70 },
  { name: '7 Up', price: 70 },
  { name: 'Mirinda', price: 70 },
  { name: 'Pakola', price: 80 },
  { name: 'Water', price: 50 },
] as const;
export const EXTRA_CHEESE_PRICE = 50;

export interface TableInfo {
  id: number;
  tableNumber: number;
  qrToken: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface KitchenOrder {
  id: number;
  orderNumber: string;
  tableId: number | null;
  tableNumber: number | null;
  guestName: string | null;
  items: any[];
  subtotal: number;
  status: string;
  createdAt: string;
}

// Dynamic add-ons fetched from API, with fallback to hardcoded defaults
const API_BASE = import.meta.env.VITE_API_URL ?? '';

let cachedAddons: AddonItem[] | null = null;

export function clearAddonCache() {
  cachedAddons = null;
}

export async function fetchAddons(): Promise<AddonItem[]> {
  if (cachedAddons) return cachedAddons;

  try {
    const res = await fetch(API_BASE + '/api/addons');
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    cachedAddons = data;
    return data;
  } catch {
    const fallback: AddonItem[] = [
      ...SAUCE_OPTIONS.map((n, i) => ({ id: i + 1, type: 'sauce' as const, name: n, price: 0, isActive: true, sortOrder: i + 1 })),
      ...DRINK_OPTIONS.map((d, i) => ({ id: i + 10, type: 'drink' as const, name: d.name, price: d.price, isActive: true, sortOrder: i + 1 })),
      { id: 20, type: 'extra' as const, name: 'Extra Cheese', price: EXTRA_CHEESE_PRICE, isActive: true, sortOrder: 1 },
    ];
    cachedAddons = fallback;
    return fallback;
  }
}

export function getSauceOptions(addons: AddonItem[]): string[] {
  return addons.filter((a) => a.type === 'sauce' && a.isActive).map((a) => a.name);
}

export function getDrinkOptions(addons: AddonItem[]): { name: string; price: number }[] {
  return addons.filter((a) => a.type === 'drink' && a.isActive).map((a) => ({ name: a.name, price: a.price }));
}

export function getExtraCheesePrice(addons: AddonItem[]): number {
  const extra = addons.find((a) => a.type === 'extra' && a.name === 'Extra Cheese' && a.isActive);
  return extra?.price ?? 50;
}
