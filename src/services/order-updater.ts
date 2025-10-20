import { IOrder, Order } from "../models";
import { fetchOrders } from "./idosell.service";
import { env } from "../config";

export const updateOrders = async () => {
  const orders = await fetchOrders();

  for (const o of orders) {
    const existing = await Order.findOne<IOrder>({
      orderNumber: o.orderNumber,
    });
    if (!existing) {
      await Order.create({
        orderNumber: o.orderNumber,
        products: o.products.map((p: any) => ({
          productId: p.id,
          quantity: p.quantity,
        })),
        totalAmount: o.totalAmount,
        status: o.status,
      });
    } else if (!["finished", "lost", "false"].includes(existing.status)) {
      existing.status = o.status;
      existing.totalAmount = o.totalAmount;
      existing.products = o.products.map((p: any) => ({
        productId: p.id,
        quantity: p.quantity,
      }));
      existing.updatedAt = new Date();
      await existing.save();
    }
  }
};

// Funkcja do cyklicznego uruchamiania
export const startOrderUpdater = () => {
  updateOrders();
  setInterval(updateOrders, env.POLLING_INTERVAL_MINUTES * 60 * 1000);
};
