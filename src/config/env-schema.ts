import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

export const envSchema = z.object({
  MONGO_URI: z.string().nonempty(),
  MONGO_DB_NAME: z.string().nonempty(),
  MONGO_INITDB_ROOT_USERNAME: z.string().nonempty(),
  MONGO_INITDB_ROOT_PASSWORD: z.string().nonempty(),
  IDOSELL_ORDERS_URL: z.string().nonempty(),
  IDOSELL_API_KEY: z.string().nonempty(),
  POLLING_INTERVAL_MINUTES: z
    .string()
    .nonempty()
    .transform((val) => parseInt(val, 10)),
  PORT: z
    .string()
    .nonempty()
    .transform((val) => parseInt(val, 10))
    .default(3000),
  ALLOWED_ORIGINS: z.string().transform((val) => {
    return val.split(",").map((origin) => origin.trim());
  }),
});

export const env = envSchema.parse(process.env);
