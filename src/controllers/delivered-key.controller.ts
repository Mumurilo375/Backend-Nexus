import { NextFunction, Request, Response } from "express";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import { getUserDeliveredKeyById, listUserDeliveredKeys } from "../services/delivered-key.service";
import {
  validateDeliveredKeyIdParam,
  validateListDeliveredKeysQuery,
} from "../validators/delivered-key.validator";

class DeliveredKeyController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListDeliveredKeysQuery(req.query);
      const items = await listUserDeliveredKeys(requireAuthenticatedUserId(req), query);
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveredKeyId = validateDeliveredKeyIdParam(req.params.id as string);
      const item = await getUserDeliveredKeyById(requireAuthenticatedUserId(req), deliveredKeyId);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }
}

export default DeliveredKeyController;
