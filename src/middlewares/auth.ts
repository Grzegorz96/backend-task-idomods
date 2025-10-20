import { Request, Response, NextFunction } from "express";
import { env } from "../config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["x-api-token"];
  if (token === env.JWT_SECRET) next();
  else res.status(401).json({ error: "Unauthorized" });
};
