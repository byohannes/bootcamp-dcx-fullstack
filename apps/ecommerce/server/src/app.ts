import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

export default app;
