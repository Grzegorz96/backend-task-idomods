import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export interface ValidatedRequest<T = any> extends Request {
  validatedData?: T;
}

// Generic validation middleware (pipe)
export const validate = <T>(
  schema: z.ZodSchema<T>,
  source: "query" | "params" | "body" = "body"
) => {
  return (req: ValidatedRequest<T>, _res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      // Add validated data to request
      req.validatedData = validatedData;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Specific validation middlewares
export const validateQuery = <T>(schema: z.ZodSchema<T>) =>
  validate(schema, "query");

export const validateParams = <T>(schema: z.ZodSchema<T>) =>
  validate(schema, "params");

export const validateBody = <T>(schema: z.ZodSchema<T>) =>
  validate(schema, "body");
