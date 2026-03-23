import { NextFunction, Request, Response } from "express";
import { listUserPurchaseHistory } from "../services/history.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { validateListOrdersQuery } from "../validators/order.validator";

class HistoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListOrdersQuery(req.query);
      const history = await listUserPurchaseHistory(requireAuthenticatedUserId(req), query);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }
}

export default HistoryController;
