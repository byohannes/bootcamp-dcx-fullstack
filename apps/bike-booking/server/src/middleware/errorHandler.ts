import { Request, Response, NextFunction } from "express";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, "CONFLICT");
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }
}

// Error handling middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.message,
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
    return;
  }

  // Handle duplicate key errors
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: "Duplicate entry",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}

// Request logging middleware
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "WARN" : "INFO";
    console.log(
      `[${logLevel}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
}

// Async handler wrapper to catch errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
