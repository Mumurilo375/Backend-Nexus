import { validatePositiveIdParam } from "../utils/request-validator";

export function validateGameIdParam(id: string): number {
  return validatePositiveIdParam(id);
}
