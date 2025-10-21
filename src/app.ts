import express from "express";
import mongoose from "mongoose";
import { env } from "./config";
import { orderController, orderService } from "./order";
import {
  corsMiddleware,
  rateLimiter,
  orderRateLimiter,
} from "./middlewares/security";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

const app = express();

app.use(express.json());

// Security middleware
app.use(corsMiddleware);
app.use(rateLimiter);

// Order routes with stricter rate limiting
app.use("/orders", orderRateLimiter, orderController.getRouter());

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Error handler - must be at the end
app.use(errorHandler);

mongoose
  .connect(env.MONGO_URI, {
    dbName: env.MONGO_DB_NAME,
    auth: {
      username: env.MONGO_INITDB_ROOT_USERNAME,
      password: env.MONGO_INITDB_ROOT_PASSWORD,
    },
  })
  .then(() => {
    console.log(`Connected to MongoDB database: ${env.MONGO_DB_NAME}`);
    orderService.startOrderUpdater();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
