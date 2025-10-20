import { Router } from "express";
import { Order } from "../models";
import { exportOrdersToCSV } from "../utils/csv";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { minWorth, maxWorth } = req.query;
  const csv = await exportOrdersToCSV(
    minWorth ? Number(minWorth) : undefined,
    maxWorth ? Number(maxWorth) : undefined
  );
  res.header("Content-Type", "text/csv");
  res.send(csv);
});

router.get("/:orderNumber", async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
