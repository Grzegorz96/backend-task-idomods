import { AsyncParser } from "@json2csv/node";
import { IOrder } from "../order/order.model";

export interface CsvOrder {
  orderNumber: number;
  totalAmount: number;
  currency: string;
  status: string;
  products: string;
}

export class CsvConverter {
  private static asyncParser = new AsyncParser<CsvOrder, CsvOrder>({
    fields: [
      {
        label: "orderNumber",
        value: "orderNumber",
      },
      {
        label: "totalAmount",
        value: "totalAmount",
      },
      {
        label: "currency",
        value: "currency",
      },
      {
        label: "status",
        value: "status",
      },
      {
        label: "products",
        value: "products",
      },
    ],
  });

  static async convertOrdersToCsv(orders: IOrder[]): Promise<string> {
    if (orders.length === 0) {
      return "orderNumber,totalAmount,currency,status,products\n";
    }

    const csvOrders: CsvOrder[] = orders.map((order) => ({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      products: order.products
        .map((p) => `${p.productId}(${p.quantity})`)
        .join("; "),
    }));

    return await this.asyncParser.parse(csvOrders).promise();
  }
}
