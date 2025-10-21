import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "../config";

// CORS configuration
export const corsMiddleware = cors({
  origin: env.ALLOWED_ORIGINS,
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
});

// Rate limiter configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for order endpoints
export const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for order endpoints
  message: {
    error: "Too Many Requests",
    message: "Too many requests to order endpoints, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
