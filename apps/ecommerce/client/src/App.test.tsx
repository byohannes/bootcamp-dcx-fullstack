import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock the api module
vi.mock("./api", () => ({
  getProducts: vi.fn().mockResolvedValue([
    {
      id: "prod-1",
      name: "Test Product",
      description: "A test product",
      price: 99.99,
      category: "electronics",
      imageUrl: "/test.jpg",
      stock: 10,
    },
    {
      id: "prod-2",
      name: "Another Product",
      description: "Another test product",
      price: 49.99,
      category: "clothing",
      imageUrl: "/test2.jpg",
      stock: 5,
    },
  ]),
  getCart: vi.fn().mockResolvedValue({
    id: "cart-1",
    userId: "user-1",
    items: [],
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  addToCart: vi.fn().mockResolvedValue({
    id: "cart-1",
    userId: "user-1",
    items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
    total: 99.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app header with logo", () => {
    render(<App />);

    expect(screen.getByText("🛒 ShopEase")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /products/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cart/i })).toBeInTheDocument();
  });

  it("displays products on load", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("navigates to cart view", async () => {
    render(<App />);

    const cartButton = screen.getByRole("button", { name: /cart/i });
    fireEvent.click(cartButton);

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });

  it("renders the footer", () => {
    render(<App />);

    expect(screen.getByText(/2025 ShopEase/i)).toBeInTheDocument();
  });

  it("shows search input in products view", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/search products/i),
      ).toBeInTheDocument();
    });
  });
});
