// Directory: src/shared/services
// src/payment/WastePayment.ts

import { PaymentMethod, PaymentStatus, Currency } from "../types/payment";

/**
 * Payment obligation created after waste screening
 */
export interface WastePayment {
  id: string;
  wasteItemId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  settledAt?: string;
  reference?: string;

  metadata?: {
    bankName?: string;
    accountNumberMasked?: string;
    cryptoWallet?: string;
    transactionHash?: string;
  };
}