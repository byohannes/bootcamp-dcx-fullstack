import express from "express";
import cors from "cors";
import bikesRouter from "./routes/bikes";
import bookingsRouter from "./routes/bookings";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/bikes", bikesRouter);
app.use("/api/bookings", bookingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

export default app;
