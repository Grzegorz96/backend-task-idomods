import { Order, IOrder, OrderFilters } from "./order.model";

export interface OrderRepository {
  findAll(filters?: OrderFilters): Promise<IOrder[]>;
  findByOrderNumber(orderNumber: number): Promise<IOrder | null>;
  findByOrderNumberForUpdate(orderNumber: number): Promise<IOrder | null>;
  create(orderData: Partial<IOrder>): Promise<IOrder>;
  update(
    orderNumber: number,
    updateData: Partial<IOrder>
  ): Promise<IOrder | null>;
  exists(orderNumber: number): Promise<boolean>;
}

export class OrderRepositoryImpl implements OrderRepository {
  async findAll(filters: OrderFilters = {}): Promise<IOrder[]> {
    const filter: any = {};

    if (filters.minWorth !== undefined) {
      filter.totalAmount = { $gte: filters.minWorth };
    }

    if (filters.maxWorth !== undefined) {
      filter.totalAmount = {
        ...filter.totalAmount,
        $lte: filters.maxWorth,
      };
    }

    return Order.find(filter).lean<IOrder[]>();
  }

  async findByOrderNumber(orderNumber: number): Promise<IOrder | null> {
    return Order.findOne({ orderNumber }).lean<IOrder>();
  }

  async findByOrderNumberForUpdate(
    orderNumber: number
  ): Promise<IOrder | null> {
    return Order.findOne({ orderNumber });
  }

  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    return Order.create(orderData);
  }

  async update(
    orderNumber: number,
    updateData: Partial<IOrder>
  ): Promise<IOrder | null> {
    const order = await Order.findOne({ orderNumber });
    if (!order) return null;

    Object.assign(order, updateData);
    await order.save();
    return order;
  }

  async exists(orderNumber: number): Promise<boolean> {
    const count = await Order.countDocuments({ orderNumber });
    return count > 0;
  }
}

// Singleton instance
export const orderRepository = new OrderRepositoryImpl();
