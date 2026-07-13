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
  baseCheese?: number;
  baseSauce?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  selectedSize?: 'small' | 'regular' | 'large';
  image: string;
  customCheese: number;
  customSauceType: string;
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
  cheeseLevel: number;
  sauceType: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
