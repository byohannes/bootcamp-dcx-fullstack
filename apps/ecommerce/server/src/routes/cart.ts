import { Router, Request, Response } from "express";
import {
  products,
  getCartWithProducts,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../data";
import { ApiResponse, Cart, CartItem } from "../types";

const router = Router();

// For simplicity, we'll use a header to identify the user/session
// In a real app, this would come from authentication
function getUserId(req: Request): string {
  return (req.headers["x-user-id"] as string) || "guest";
}

// GET /api/cart - Get current cart
router.get("/", (req: Request, res: Response) => {
  const userId = getUserId(req);
  const cart = getCartWithProducts(userId);

  const response: ApiResponse<typeof cart> = {
    success: true,
    data: cart,
  };
  res.json(response);
});

// POST /api/cart/items - Add item to cart
router.post("/items", (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { productId, quantity } = req.body;

  // Validate required fields
  if (!productId) {
    const response: ApiResponse<null> = {
      success: false,
      error: "productId is required",
    };
    res.status(400).json(response);
    return;
  }

  // Validate quantity
  const qty = quantity || 1;
  if (typeof qty !== "number" || qty < 1) {
    const response: ApiResponse<null> = {
      success: false,
      error: "quantity must be a positive number",
    };
    res.status(400).json(response);
    return;
  }

  // Check product exists
  const product = products.find((p) => p.id === productId);
  if (!product) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Product not found",
    };
    res.status(404).json(response);
    return;
  }

  // Check stock
  if (product.stock < qty) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Insufficient stock",
    };
    res.status(400).json(response);
    return;
  }

  const item = addToCart(userId, productId, qty);

  if (!item) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to add item to cart",
    };
    res.status(500).json(response);
    return;
  }

  // Return updated cart
  const cart = getCartWithProducts(userId);
  const response: ApiResponse<typeof cart> = {
    success: true,
    data: cart,
  };
  res.status(201).json(response);
});

// PATCH /api/cart/items/:id - Update item quantity
router.patch("/items/:id", (req: Request, res: Response) => {
  const userId = getUserId(req);
  const itemId = req.params.id as string;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity < 0) {
    const response: ApiResponse<null> = {
      success: false,
      error: "quantity must be a non-negative number",
    };
    res.status(400).json(response);
    return;
  }

  // If quantity is 0, remove the item
  if (quantity === 0) {
    const removed = removeFromCart(userId, itemId);
    if (!removed) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Item not found in cart",
      };
      res.status(404).json(response);
      return;
    }
  } else {
    const item = updateCartItemQuantity(userId, itemId, quantity);
    if (!item) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Item not found in cart",
      };
      res.status(404).json(response);
      return;
    }
  }

  const cart = getCartWithProducts(userId);
  const response: ApiResponse<typeof cart> = {
    success: true,
    data: cart,
  };
  res.json(response);
});

// DELETE /api/cart/items/:id - Remove item from cart
router.delete("/items/:id", (req: Request, res: Response) => {
  const userId = getUserId(req);
  const itemId = req.params.id as string;

  const removed = removeFromCart(userId, itemId);

  if (!removed) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Item not found in cart",
    };
    res.status(404).json(response);
    return;
  }

  const cart = getCartWithProducts(userId);
  const response: ApiResponse<typeof cart> = {
    success: true,
    data: cart,
  };
  res.json(response);
});

// DELETE /api/cart - Clear entire cart
router.delete("/", (req: Request, res: Response) => {
  const userId = getUserId(req);
  clearCart(userId);

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: "Cart cleared" },
  };
  res.json(response);
});

export default router;
