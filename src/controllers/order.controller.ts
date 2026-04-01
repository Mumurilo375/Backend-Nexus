import { NextFunction, Request, Response } from "express";
import { getUserOrderById, listUserOrders } from "../services/orders.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateListOrdersQuery, validateOrderIdParam } from "../validators/order.validator";

class OrderController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListOrdersQuery(req.query);
      const orders = await listUserOrders(requireAuthenticatedUserId(req), query);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = validateOrderIdParam(req.params.id as string);
      const order = await getUserOrderById(requireAuthenticatedUserId(req), orderId);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
