import { IOrder, OrderFilters } from "./order.model";
import { IdosellOrder, idosellService } from "../idosell";
import { env } from "../config";
import { orderRepository } from "./order.repository";
import { FINAL_STATUSES } from "./order.constants";
import { CsvConverter } from "../utils/csv";
import * as cron from "node-cron";
import { CRON_EXPRESSION } from "./order.constants";

interface OrderStats {
  created: number;
  updated: number;
  skipped: number;
}

interface ExtractedOrderData {
  baseCurrency: IdosellOrder["orderDetails"]["payments"]["orderBaseCurrency"];
  orderCurrency: IdosellOrder["orderDetails"]["payments"]["orderCurrency"];
  products: Array<{ productId: number; quantity: number }>;
}

export interface OrderService {
  // getAllOrders(filters?: OrderFilters): Promise<IOrder[]>;
  getOrderByNumber(orderNumber: number): Promise<IOrder | null>;
  getOrdersAsCsv(filters?: OrderFilters): Promise<string>;
  updateOrders(): Promise<void>;
  startOrderUpdater(): void;
  stopOrderUpdater(task: cron.ScheduledTask): void;
}

export class OrderServiceImpl implements OrderService {
  private getAllOrders(filters: OrderFilters = {}): Promise<IOrder[]> {
    return orderRepository.findAll(filters);
  }

  getOrderByNumber(orderNumber: number): Promise<IOrder | null> {
    return orderRepository.findByOrderNumber(orderNumber);
  }

  async getOrdersAsCsv(filters: OrderFilters = {}): Promise<string> {
    const orders = await this.getAllOrders(filters);
    return await CsvConverter.convertOrdersToCsv(orders);
  }

  async updateOrders(): Promise<void> {
    try {
      console.log("Starting order update process...");

      const orders = await idosellService.getOrders();
      if (orders.length === 0) {
        console.log("No orders to process");
        return;
      }

      const stats: OrderStats = { created: 0, updated: 0, skipped: 0 };

      for (const orderData of orders) {
        try {
          await this.processOrder(orderData, stats);
        } catch (error) {
          console.error(
            `Error processing order ${orderData.orderSerialNumber}:`,
            error
          );
        }
      }

      console.log(`Order update completed:`, {
        total: orders.length,
        ...stats,
      });
    } catch (error) {
      console.error("Error during order update:", error);
    }
  }

  private async processOrder(
    orderData: IdosellOrder,
    stats: OrderStats
  ): Promise<void> {
    const existing = await orderRepository.findByOrderNumberForUpdate(
      orderData.orderSerialNumber
    );

    if (!existing) {
      await this.createOrder(orderData);
      stats.created++;
    } else if (!FINAL_STATUSES.includes(existing.status)) {
      const updated = await this.updateOrderIfChanged(existing, orderData);
      if (updated) stats.updated++;
      else stats.skipped++;
    } else {
      stats.skipped++;
    }
  }

  private async createOrder(orderData: IdosellOrder): Promise<void> {
    const { baseCurrency, orderCurrency, products } =
      this.extractOrderData(orderData);

    await orderRepository.create({
      orderNumber: orderData.orderSerialNumber,
      products,
      totalAmount: baseCurrency.orderProductsCost,
      currency: baseCurrency.billingCurrency,
      status: orderData.orderDetails.orderStatus,
    });

    console.log(
      `Created new order: ${orderData.orderSerialNumber} - Amount: ${baseCurrency.orderProductsCost} ${baseCurrency.billingCurrency} (original: ${orderCurrency.orderProductsCost} ${orderCurrency.currencyId})`
    );
  }

  private async updateOrderIfChanged(
    existing: IOrder,
    orderData: IdosellOrder
  ): Promise<boolean> {
    const { baseCurrency, orderCurrency, products } =
      this.extractOrderData(orderData);

    const hasChanges = this.hasOrderChanged(
      existing,
      orderData,
      baseCurrency,
      products
    );

    if (hasChanges) {
      await orderRepository.update(orderData.orderSerialNumber, {
        status: orderData.orderDetails.orderStatus,
        totalAmount: baseCurrency.orderProductsCost,
        currency: baseCurrency.billingCurrency,
        products,
      });

      console.log(
        `Updated order: ${orderData.orderSerialNumber} (status: ${orderData.orderDetails.orderStatus}) - Amount: ${baseCurrency.orderProductsCost} ${baseCurrency.billingCurrency} (original: ${orderCurrency.orderProductsCost} ${orderCurrency.currencyId})`
      );
      return true;
    }

    return false;
  }

  private extractOrderData(orderData: IdosellOrder): ExtractedOrderData {
    const baseCurrency = orderData.orderDetails.payments.orderBaseCurrency;
    const orderCurrency = orderData.orderDetails.payments.orderCurrency;
    const products = orderData.orderDetails.productsResults.map((p) => ({
      productId: p.productId,
      quantity: p.productQuantity,
    }));

    return { baseCurrency, orderCurrency, products };
  }

  private hasOrderChanged(
    existing: IOrder,
    orderData: IdosellOrder,
    baseCurrency: ExtractedOrderData["baseCurrency"],
    products: ExtractedOrderData["products"]
  ): boolean {
    return (
      existing.status !== orderData.orderDetails.orderStatus ||
      existing.totalAmount !== baseCurrency.orderProductsCost ||
      JSON.stringify(existing.products) !== JSON.stringify(products)
    );
  }

  startOrderUpdater(): void {
    // Uruchom natychmiast
    this.updateOrders();

    cron.schedule(CRON_EXPRESSION, () => {
      console.log(
        `Running scheduled order update at ${new Date().toISOString()}`
      );
      this.updateOrders();
    });

    console.log(`Cron job scheduled with expression: ${CRON_EXPRESSION}`);
  }

  stopOrderUpdater(task: cron.ScheduledTask): void {
    task.stop();
    console.log("Order updater cron job stopped");
  }
}

// Singleton instance
export const orderService = new OrderServiceImpl();
