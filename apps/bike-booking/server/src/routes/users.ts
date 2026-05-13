import { Router } from "express";
import { User } from "../db/models";
import type { RegisterRequest, LoginRequest, ApiResponse } from "../types";

const router = Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
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

    // Password is hashed automatically by the User model's pre-save hook.
    const newUser = new User({
      email,
      password,
      name,
    });

    await newUser.save();

    const response: ApiResponse<unknown> = {
      success: true,
      data: newUser.toJSON(),
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate required fields
    if (!email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Email and password are required",
      };
      return res.status(400).json(response);
    }

    // Find user by email (need to select password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    // Use the model's comparePassword to validate against the stored hash.
    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: user.toJSON(),
    };
    res.json(response);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: user.toJSON(),
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
