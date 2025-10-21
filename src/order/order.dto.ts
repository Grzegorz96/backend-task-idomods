import { z } from "zod";

// DTO for query parameters GET /orders
export const GetOrdersQueryDto = z
  .object({
    minWorth: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "minWorth must be a non-negative number",
      }),
    maxWorth: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "maxWorth must be a non-negative number",
      }),
  })
  .refine(
    (data) => {
      // minWorth cannot be greater than maxWorth
      if (data.minWorth !== undefined && data.maxWorth !== undefined) {
        return data.minWorth <= data.maxWorth;
      }
      return true;
    },
    {
      message: "minWorth cannot be greater than maxWorth",
    }
  );

// DTO for path parameters GET /orders/:orderNumber
export const GetOrderParamsDto = z.object({
  orderNumber: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "orderNumber must be a positive number",
    }),
});

// TypeScript types generated from DTO
export type GetOrdersQuery = z.infer<typeof GetOrdersQueryDto>;
export type GetOrderParams = z.infer<typeof GetOrderParamsDto>;
