import { validatePositiveIdParam } from "../utils/request-validator";

export function validateListingIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
