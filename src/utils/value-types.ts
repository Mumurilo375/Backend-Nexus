export type PrimitiveValue = string | number | boolean | null | undefined;

export type InputValue = PrimitiveValue | Date | InputObject | InputValue[];

export interface InputObject {
  [key: string]: InputValue;
}

export type PlainValue = PrimitiveValue | Date | PlainObject | PlainValue[];

export interface PlainObject {
  [key: string]: PlainValue;
}

export type ErrorLike =
  | Error
  | {
      code?: string;
      message?: string;
      status?: number;
      statusCode?: number;
      type?: string;
    }
  | null
  | undefined;
