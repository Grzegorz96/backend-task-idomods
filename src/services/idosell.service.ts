import axios from "axios";
import { env } from "../config";

export const fetchOrders = async () => {
  try {
    const options = {
      method: "GET",
      url: env.IDOSELL_ORDERS_URL,
      headers: {
        accept: "application/json",
        "X-API-KEY": env.IDOSELL_API_KEY,
      },
    };
    const response = await axios.request(options);
    return response.data.orders || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
};
