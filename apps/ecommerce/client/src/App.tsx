import { useState } from "react";
import { Product, View } from "./types";
import { addToCart } from "./api";
import { ProductList } from "./components/ProductList";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import "./App.css";

function App() {
  const [view, setView] = useState<View>("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartRefresh, setCartRefresh] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setView("product-detail");
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      await addToCart({ productId: product.id, quantity });
      setCartRefresh((prev) => prev + 1);
      showNotification(`Added ${quantity} × ${product.name} to cart`);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to add to cart",
      );
    }
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setView("products");
  };

  const renderContent = () => {
    switch (view) {
      case "products":
        return (
          <ProductList
            onViewDetails={handleViewDetails}
            onAddToCart={(product) => handleAddToCart(product)}
          />
        );
      case "product-detail":
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackToProducts}
            onAddToCart={handleAddToCart}
          />
        ) : null;
      case "cart":
        return (
          <Cart
            onBackToProducts={handleBackToProducts}
            refreshTrigger={cartRefresh}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo" onClick={handleBackToProducts}>
          🛒 ShopEase
        </div>
        <nav className="app-nav">
          <button
            className={view === "products" ? "active" : ""}
            onClick={handleBackToProducts}
          >
            Products
          </button>
          <button
            className={view === "cart" ? "active" : ""}
            onClick={() => setView("cart")}
          >
            Cart
          </button>
        </nav>
      </header>

      {notification && <div className="notification">{notification}</div>}

      <main className="app-main">{renderContent()}</main>

      <footer className="app-footer">
        <p>&copy; 2025 ShopEase. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
