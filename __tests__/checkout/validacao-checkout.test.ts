import { describe, expect, it } from "@jest/globals";
import { AppError } from "../../src/utils/app-error";
import { validateCheckoutInput } from "../../src/validators/checkout.validator";

describe("checkout", () => {
  it("aceita métodos válidos", () => {
    expect(validateCheckoutInput({ paymentMethod: "pix" })).toEqual({ paymentMethod: "pix" });
    expect(validateCheckoutInput({ paymentMethod: "CARD" })).toEqual({ paymentMethod: "card" });
    expect(validateCheckoutInput({ paymentMethod: "paypal" })).toEqual({ paymentMethod: "paypal" });
  });

  it("rejeita método inválido", () => {
    expect(() => validateCheckoutInput({ paymentMethod: "boleto" })).toThrow(AppError);
    expect(() => validateCheckoutInput({ paymentMethod: "boleto" })).toThrow("paymentMethod must be 'card', 'paypal' or 'pix'");
  });
});
