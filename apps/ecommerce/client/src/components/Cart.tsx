import { useState, useEffect } from "react";
import { Cart as CartType, CartItem } from "../types";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../api";
import "./Cart.css";

interface CartProps {
  onBackToProducts: () => void;
  refreshTrigger: number;
}

export function Cart({ onBackToProducts, refreshTrigger }: CartProps) {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, [refreshTrigger]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      setUpdating(item.id);
      const updatedCart = await updateCartItem(item.id, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const updatedCart = await removeFromCart(itemId);
      setCart(updatedCart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);
      await clearCart();
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cart");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items yet.</p>
        <button className="continue-shopping-btn" onClick={onBackToProducts}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <span className="cart-count">{cart.items.length} items</span>
      </div>

      <div className="cart-items">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className={`cart-item ${updating === item.id ? "updating" : ""}`}
          >
            {item.product && (
              <>
                <div className="cart-item-image">
                  <img src={item.product.imageUrl} alt={item.product.name} />
                </div>
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-price">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleUpdateQuantity(item, -1)}
                    disabled={item.quantity <= 1 || updating === item.id}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item, 1)}
                    disabled={updating === item.id}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={updating === item.id}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <button className="clear-cart-btn" onClick={handleClearCart}>
          Clear Cart
        </button>
        <div className="cart-total">
          <span>Total:</span>
          <span className="cart-total-amount">${cart.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <button className="continue-shopping-btn" onClick={onBackToProducts}>
          Continue Shopping
        </button>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  );
}
