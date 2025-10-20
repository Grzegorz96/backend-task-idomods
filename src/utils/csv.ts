import { Transform } from "@json2csv/node";
import { Order } from "../models";
import { Readable } from "stream";

export const exportOrdersToCSV = async (
  minWorth?: number,
  maxWorth?: number
): Promise<string> => {
  // Przygotowanie filtra
  const filter: any = {};
  if (minWorth !== undefined) filter.totalAmount = { $gte: minWorth };
  if (maxWorth !== undefined)
    filter.totalAmount = { ...filter.totalAmount, $lte: maxWorth };

  const orders = await Order.find(filter).lean();

  if (orders.length === 0) return "";

  // Konwertujemy tablicę do streamu
  const readable = Readable.from(orders);

  // Tworzymy parser CSV
  const transformOpts = {
    fields: ["orderNumber", "totalAmount", "products"],
  };
  const parser = new Transform(transformOpts);

  let csv = "";
  const chunks: string[] = [];

  return new Promise((resolve, reject) => {
    readable
      .pipe(parser)
      .on("data", (chunk: Buffer | string) => chunks.push(chunk.toString()))
      .on("end", () => resolve(chunks.join("")))
      .on("error", (err) => reject(err));
  });
};
