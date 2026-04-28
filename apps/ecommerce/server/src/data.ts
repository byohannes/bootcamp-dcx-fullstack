import { Product, Cart, CartItem } from "./types";

// Sample products data
export const products: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Headphones",
    description:
      "Premium noise-canceling wireless headphones with 30-hour battery life",
    price: 199.99,
    category: "electronics",
    imageUrl: "/images/headphones.jpg",
    stock: 50,
  },
  {
    id: "prod-2",
    name: "Running Shoes",
    description: "Lightweight and comfortable running shoes for all terrains",
    price: 129.99,
    category: "sports",
    imageUrl: "/images/shoes.jpg",
    stock: 30,
  },
  {
    id: "prod-3",
    name: "JavaScript: The Good Parts",
    description: "Classic programming book by Douglas Crockford",
    price: 29.99,
    category: "books",
    imageUrl: "/images/js-book.jpg",
    stock: 100,
  },
  {
    id: "prod-4",
    name: "Cotton T-Shirt",
    description: "Soft, breathable cotton t-shirt in multiple colors",
    price: 24.99,
    category: "clothing",
    imageUrl: "/images/tshirt.jpg",
    stock: 200,
  },
  {
    id: "prod-5",
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    price: 249.99,
    category: "electronics",
    imageUrl: "/images/smartwatch.jpg",
    stock: 25,
  },
  {
    id: "prod-6",
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap",
    price: 39.99,
    category: "sports",
    imageUrl: "/images/yoga-mat.jpg",
    stock: 75,
  },
  {
    id: "prod-7",
    name: "Coffee Maker",
    description: "Automatic drip coffee maker with programmable timer",
    price: 79.99,
    category: "home",
    imageUrl: "/images/coffee-maker.jpg",
    stock: 40,
  },
  {
    id: "prod-8",
    name: "Denim Jacket",
    description: "Classic denim jacket with modern fit",
    price: 89.99,
    category: "clothing",
    imageUrl: "/images/denim-jacket.jpg",
    stock: 60,
  },
];

// Carts storage (in-memory, keyed by session/user ID)
export const carts: Map<string, Cart> = new Map();

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create cart for a user/session
export function getOrCreateCart(userId: string): Cart {
  let cart = carts.get(userId);
  if (!cart) {
    cart = {
      id: generateId(),
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    carts.set(userId, cart);
  }
  return cart;
}

// Add item to cart
export function addToCart(
  userId: string,
  productId: string,
  quantity: number,
): CartItem | null {
  const product = products.find((p) => p.id === productId);
  if (!product) return null;

  const cart = getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    cart.updatedAt = new Date().toISOString();
    return existingItem;
  }

  const newItem: CartItem = {
    id: generateId(),
    productId,
    quantity,
  };
  cart.items.push(newItem);
  cart.updatedAt = new Date().toISOString();
  return newItem;
}

// Remove item from cart
export function removeFromCart(userId: string, itemId: string): boolean {
  const cart = carts.get(userId);
  if (!cart) return false;

  const itemIndex = cart.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return false;

  cart.items.splice(itemIndex, 1);
  cart.updatedAt = new Date().toISOString();
  return true;
}

// Update item quantity
export function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
): CartItem | null {
  const cart = carts.get(userId);
  if (!cart) return null;

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return null;

  item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  return item;
}

// Get cart with enriched product data
export function getCartWithProducts(userId: string): Cart & { total: number } {
  const cart = getOrCreateCart(userId);
  let total = 0;

  const itemsWithProducts = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
    return {
      ...item,
      product: product || undefined,
    };
  });

  return {
    ...cart,
    items: itemsWithProducts,
    total: Math.round(total * 100) / 100,
  };
}

// Clear cart
export function clearCart(userId: string): void {
  carts.delete(userId);
}
