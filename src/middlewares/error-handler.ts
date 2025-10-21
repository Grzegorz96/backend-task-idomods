import { Request, Response, NextFunction } from "express";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../utils/errors";

// Middleware for error handling
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Custom errors
  if (error instanceof NotFoundError) {
    return res.status(error.statusCode).json({
      error: "Not Found",
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      error: "Validation Error",
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return res.status(error.statusCode).json({
      error: "Unauthorized",
      message: error.message,
    });
  }

  // Zod validation error
  if (error.name === "ZodError") {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid input data",
      details: error.message,
    });
  }

  // MongoDB error
  if (error.name === "MongoError" || error.name === "MongooseError") {
    return res.status(500).json({
      error: "Database Error",
      message: "Database operation failed",
    });
  }

  // External API connection error
  if (error.name === "AxiosError") {
    return res.status(502).json({
      error: "External API Error",
      message: "Failed to fetch data from external service",
    });
  }

  // Authorization error
  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  // Default server error
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
};

// Middleware for handling non-existent routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      "GET /orders - Get all orders as CSV",
      "GET /orders/:orderNumber - Get specific order",
    ],
  });
};
