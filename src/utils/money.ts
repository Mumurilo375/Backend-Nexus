import { PlainObject, PlainValue } from "./value-types";

export function toNumber(value: PlainValue): number {
  return Number(value) || 0;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getMaxDiscountPercentage(
  promotions: Array<{ discountPercentage?: PlainValue } | PlainObject>,
): number {
  return promotions.reduce((highestDiscount, promotion) => {
    const currentDiscount = toNumber(promotion.discountPercentage);
    return currentDiscount > highestDiscount ? currentDiscount : highestDiscount;
  }, 0);
}

export function buildPricing(
  basePriceValue: PlainValue,
  discountPercentageValue: PlainValue,
) {
  const basePrice = toNumber(basePriceValue);
  const discountPercentage = toNumber(discountPercentageValue);
  const discountAmount = roundMoney((basePrice * discountPercentage) / 100);
  const finalPrice = roundMoney(basePrice - discountAmount);

  return {
    basePrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    hasDiscount: discountPercentage > 0,
  };
}

export function buildPricingFromPromotions(
  basePriceValue: PlainValue,
  promotions: Array<{ discountPercentage?: PlainValue } | PlainObject>,
) {
  return buildPricing(basePriceValue, getMaxDiscountPercentage(promotions));
}
