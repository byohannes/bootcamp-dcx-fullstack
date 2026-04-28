import { ApiResponse, Product, Cart, AddToCartRequest } from "./types";

const API_BASE = "/api";

// For simplicity, use a constant user ID
// In a real app, this would come from authentication
const USER_ID = "user-1";

const defaultHeaders = {
  "Content-Type": "application/json",
  "x-user-id": USER_ID,
};

// Products API
export async function getProducts(
  category?: string,
  search?: string,
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);

  const queryString = params.toString();
  const url = `${API_BASE}/products${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  const data: ApiResponse<Product[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch products");
  }
  return data.data || [];
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  const data: ApiResponse<Product> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch product");
  }
  return data.data!;
}

// Cart API
export async function getCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart`, {
    headers: defaultHeaders,
  });
  const data: ApiResponse<Cart> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch cart");
  }
  return data.data!;
}

export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(request),
  });
  const data: ApiResponse<Cart> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to add to cart");
  }
  return data.data!;
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify({ quantity }),
  });
  const data: ApiResponse<Cart> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to update cart");
  }
  return data.data!;
}

export async function removeFromCart(itemId: string): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: "DELETE",
    headers: defaultHeaders,
  });
  const data: ApiResponse<Cart> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to remove from cart");
  }
  return data.data!;
}

export async function clearCart(): Promise<void> {
  const response = await fetch(`${API_BASE}/cart`, {
    method: "DELETE",
    headers: defaultHeaders,
  });
  const data: ApiResponse<{ message: string }> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to clear cart");
  }
}
