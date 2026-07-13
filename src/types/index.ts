export interface MenuItem {
  id: number;
  name: string;
  category: 'classic' | 'special' | 'deal';
  price: number;
  prices?: {
    small: number;
    regular: number;
    large: number;
  };
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
  image: string;
  addons: CartAddon[];
}

export type OrderStatus = 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderDetails {
  id: string;
  total: number;
  itemsCount: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  clerkUserId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  items: CartItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
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
  extraCheese: boolean;
  sauce: string;
  drink: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const SAUCE_OPTIONS = [
  'Ketchup',
  'Mayo',
  'BBQ Sauce',
  'Ranch',
  'Garlic Mayo',
] as const;

export const DRINK_OPTIONS = [
  { name: 'Pepsi', price: 70 },
  { name: '7 Up', price: 70 },
  { name: 'Mirinda', price: 70 },
  { name: 'Pakola', price: 80 },
  { name: 'Water', price: 50 },
] as const;

export const EXTRA_CHEESE_PRICE = 50;
