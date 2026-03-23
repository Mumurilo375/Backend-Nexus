import { NextFunction, Request, Response } from "express";
import { getUserOrderItemById, listUserOrderItems } from "../services/order-item.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateListOrderItemsQuery,
  validateOrderItemIdParam,
} from "../validators/order-item.validator";

class OrderItemController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListOrderItemsQuery(req.query);
      const items = await listUserOrderItems(requireAuthenticatedUserId(req), query);
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderItemId = validateOrderItemIdParam(req.params.id as string);
      const item = await getUserOrderItemById(requireAuthenticatedUserId(req), orderItemId);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }
}

export default OrderItemController;
