import request from "supertest";
import app from "./app";
import { carts } from "./data";

// Clear carts before each test
beforeEach(() => {
  carts.clear();
});

describe("Health API", () => {
  describe("GET /api/health", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });

    it("should return JSON content type", async () => {
      const response = await request(app).get("/api/health");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});

describe("Products API", () => {
  describe("GET /api/products", () => {
    it("should return list of products", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should filter products by category", async () => {
      const response = await request(app).get(
        "/api/products?category=electronics",
      );

      expect(response.status).toBe(200);
      response.body.data.forEach((product: { category: string }) => {
        expect(product.category).toBe("electronics");
      });
    });

    it("should search products by name", async () => {
      const response = await request(app).get(
        "/api/products?search=headphones",
      );

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name.toLowerCase()).toContain("headphone");
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product", async () => {
      const response = await request(app).get("/api/products/prod-1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("prod-1");
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app).get("/api/products/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const response = await request(app).post("/api/products").send({
        name: "Test Product",
        description: "A test product",
        price: 99.99,
        category: "electronics",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Product");
    });

    it("should require all fields", async () => {
      const response = await request(app)
        .post("/api/products")
        .send({ name: "Incomplete" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("Cart API", () => {
  const userId = "test-user";

  describe("GET /api/cart", () => {
    it("should return empty cart for new user", async () => {
      const response = await request(app)
        .get("/api/cart")
        .set("x-user-id", userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe("POST /api/cart/items", () => {
    it("should add item to cart", async () => {
      const response = await request(app)
        .post("/api/cart/items")
        .set("x-user-id", userId)
        .send({ productId: "prod-1", quantity: 2 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app)
        .post("/api/cart/items")
        .set("x-user-id", userId)
        .send({ productId: "non-existent", quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/cart/items/:id", () => {
    it("should remove item from cart", async () => {
      // Add item first
      const addResponse = await request(app)
        .post("/api/cart/items")
        .set("x-user-id", userId)
        .send({ productId: "prod-1", quantity: 1 });

      const itemId = addResponse.body.data.items[0].id;

      // Remove item
      const response = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set("x-user-id", userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(0);
    });

    it("should return 404 for non-existent item", async () => {
      const response = await request(app)
        .delete("/api/cart/items/non-existent")
        .set("x-user-id", userId);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("Express App", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
  });
});
