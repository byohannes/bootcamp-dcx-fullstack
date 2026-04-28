import { Router, Request, Response } from "express";
import { products, generateId } from "../data";
import { ApiResponse, Product } from "../types";

const router = Router();

// GET /api/products - List all products
router.get("/", (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice } = req.query;

  let filteredProducts = [...products];

  // Filter by category
  if (category && typeof category === "string") {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  // Search by name or description
  if (search && typeof search === "string") {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower),
    );
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) {
      filteredProducts = filteredProducts.filter((p) => p.price >= min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) {
      filteredProducts = filteredProducts.filter((p) => p.price <= max);
    }
  }

  const response: ApiResponse<Product[]> = {
    success: true,
    data: filteredProducts,
  };
  res.json(response);
});

// GET /api/products/:id - Get single product
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const product = products.find((p) => p.id === id);

  if (!product) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Product not found",
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Product> = {
    success: true,
    data: product,
  };
  res.json(response);
});

// POST /api/products - Create new product (admin)
router.post("/", (req: Request, res: Response) => {
  const { name, description, price, category, imageUrl, stock } = req.body;

  // Validate required fields
  if (!name || !description || price === undefined || !category) {
    const response: ApiResponse<null> = {
      success: false,
      error: "name, description, price, and category are required",
    };
    res.status(400).json(response);
    return;
  }

  // Validate price
  if (typeof price !== "number" || price < 0) {
    const response: ApiResponse<null> = {
      success: false,
      error: "price must be a non-negative number",
    };
    res.status(400).json(response);
    return;
  }

  // Validate category
  const validCategories = [
    "electronics",
    "clothing",
    "books",
    "home",
    "sports",
  ];
  if (!validCategories.includes(category)) {
    const response: ApiResponse<null> = {
      success: false,
      error: `category must be one of: ${validCategories.join(", ")}`,
    };
    res.status(400).json(response);
    return;
  }

  const newProduct: Product = {
    id: generateId(),
    name,
    description,
    price,
    category,
    imageUrl: imageUrl || "/images/placeholder.jpg",
    stock: stock || 0,
  };

  products.push(newProduct);

  const response: ApiResponse<Product> = {
    success: true,
    data: newProduct,
  };
  res.status(201).json(response);
});

export default router;
