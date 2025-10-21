import { Router, Response, NextFunction } from "express";
import { orderService } from "./order.service";
import { GetOrdersQueryDto, GetOrderParamsDto } from "./order.dto";
import {
  validateQuery,
  validateParams,
  ValidatedRequest,
} from "../middlewares/validation";
import { NotFoundError } from "../utils/errors";

export class OrderController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /orders - retrieve all orders in CSV format
    this.router.get(
      "/",
      validateQuery(GetOrdersQueryDto),
      this.getAllOrders.bind(this)
    );

    // GET /orders/:orderNumber - retrieve specific order by number
    this.router.get(
      "/:orderNumber",
      validateParams(GetOrderParamsDto),
      this.getOrderByNumber.bind(this)
    );
  }

  private async getAllOrders(
    req: ValidatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.validatedData!;

      const csv = await orderService.getOrdersAsCsv(filters);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  private async getOrderByNumber(
    req: ValidatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderNumber } = req.validatedData!;

      const order = await orderService.getOrderByNumber(orderNumber);

      if (!order) {
        return next(
          new NotFoundError(`Order with number ${orderNumber} not found`)
        );
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

// Singleton instance
export const orderController = new OrderController();
