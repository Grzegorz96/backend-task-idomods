import express from "express";
import mongoose from "mongoose";
import { env } from "./config";
import ordersController from "./controllers/orders.controller";
import { startOrderUpdater } from "./services/order-updater";

const app = express();

app.use(express.json());
app.use("/orders", ordersController);

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    startOrderUpdater();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
