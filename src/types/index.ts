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

export interface OrderDetails {
  id: string;
  total: number;
  itemsCount: number;
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
