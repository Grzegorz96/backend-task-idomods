import axios, { AxiosResponse } from "axios";
import { env } from "../config";

export interface IdosellOrder {
  orderSerialNumber: number;
  orderDetails: {
    orderStatus: string;
    productsResults: Array<{
      productId: number;
      productQuantity: number;
    }>;
    payments: {
      orderCurrency: {
        currencyId: string;
        orderProductsCost: number;
      };
      orderBaseCurrency: {
        orderProductsCost: number;
        billingCurrency: string;
      };
    };
  };
}

export interface IdosellResponse {
  Results: IdosellOrder[];
  resultsNumberAll: number;
}

export interface IdosellRepository {
  fetchOrders(): Promise<IdosellOrder[]>;
}

export class IdosellRepositoryImpl implements IdosellRepository {
  async fetchOrders(): Promise<IdosellOrder[]> {
    try {
      const options = {
        method: "GET",
        url: env.IDOSELL_ORDERS_URL,
        headers: {
          accept: "application/json",
          "X-API-KEY": env.IDOSELL_API_KEY,
        },
      };

      console.log("Fetching orders from Idosell API...");
      const response: AxiosResponse<IdosellResponse> = await axios.request(
        options
      );

      if (!response.data || !Array.isArray(response.data.Results)) {
        console.warn("Invalid response format from Idosell API");
        return [];
      }

      console.log(
        `Successfully fetched ${response.data.Results.length} orders from Idosell`
      );

      return response.data.Results;
    } catch (err) {
      console.error("Error fetching orders:", err);
      return [];
    }
  }
}

// Singleton instance
export const idosellRepository = new IdosellRepositoryImpl();
