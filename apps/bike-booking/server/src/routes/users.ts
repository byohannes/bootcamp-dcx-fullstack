import { Router } from "express";
import { users, generateId } from "../data";
import type {
  RegisterRequest,
  LoginRequest,
  ApiResponse,
  User,
} from "../types";

const router = Router();

// Register new user
router.post("/register", (req, res) => {
  const { email, password, name } = req.body as RegisterRequest;

  // Validate required fields
  if (!email || !password || !name) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Email, password, and name are required",
    };
    return res.status(400).json(response);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid email format",
    };
    return res.status(400).json(response);
  }

  // Check if email already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Email already registered",
    };
    return res.status(409).json(response);
  }

  // Validate password length
  if (password.length < 6) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Password must be at least 6 characters",
    };
    return res.status(400).json(response);
  }

  // Create new user (in production, password would be hashed)
  const newUser: User = {
    id: generateId(),
    email,
    password, // In production: await bcrypt.hash(password, 10)
    name,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  const response: ApiResponse<Omit<User, "password">> = {
    success: true,
    data: userWithoutPassword,
  };
  res.status(201).json(response);
});

// Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body as LoginRequest;

  // Validate required fields
  if (!email || !password) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Email and password are required",
    };
    return res.status(400).json(response);
  }

  // Find user by email
  const user = users.find((u) => u.email === email);
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid email or password",
    };
    return res.status(401).json(response);
  }

  // Check password (in production, use bcrypt.compare)
  if (user.password !== password) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid email or password",
    };
    return res.status(401).json(response);
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  const response: ApiResponse<Omit<User, "password">> = {
    success: true,
    data: userWithoutPassword,
  };
  res.json(response);
});

// Get user by ID
router.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: "User not found",
    };
    return res.status(404).json(response);
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  const response: ApiResponse<Omit<User, "password">> = {
    success: true,
    data: userWithoutPassword,
  };
  res.json(response);
});

export default router;
