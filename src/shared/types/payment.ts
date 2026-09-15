// Directory: src/shared/types
export type PaymentMethod =
  | "CASH"
  | "EFT"
  | "BANK_PROMISSORY"
  | "CRYPTO"
  | "IN_APP_WALLET";

export type PaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "SETTLED"
  | "FAILED"
  | "CANCELLED";

export type Currency = "ZAR";