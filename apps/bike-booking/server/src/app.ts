import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import bikesRouter from "./routes/bikes";
import bookingsRouter from "./routes/bookings";
import usersRouter from "./routes/users";
import { errorHandler, requestLogger } from "./middleware";
import { openapiSpec } from "./openapi";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check with database status
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbStatus] || "unknown",
      connected: dbStatus === 1,
    },
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/bikes", bikesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/users", usersRouter);

// OpenAPI: raw spec and interactive Swagger UI
app.get("/api/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: "Bike Booking API Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
