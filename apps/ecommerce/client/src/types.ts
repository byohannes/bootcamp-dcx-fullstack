export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "electronics" | "clothing" | "books" | "home" | "sports";
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type View = "products" | "product-detail" | "cart";
