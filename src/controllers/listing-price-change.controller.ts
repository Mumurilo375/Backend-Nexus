import { NextFunction, Request, Response } from "express";
import { listListingPriceChanges } from "../services/listing-price-change.service";
import { validateListListingPriceChangesQuery } from "../validators/listing-price-change.validator";

class ListingPriceChangeController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateListListingPriceChangesQuery(req.query);
      const priceChanges = await listListingPriceChanges(query);
      res.status(200).json(priceChanges);
    } catch (error) {
      next(error);
    }
  }
}

export default ListingPriceChangeController;
