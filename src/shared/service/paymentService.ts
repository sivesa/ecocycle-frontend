// Directory: src/shared/services
// src/payment/paymentService.ts

import { WastePayment } from "./WastePayment";
import { PaymentMethod } from "../types/payment";

/**
 * Create a new payment obligation after screening
 */
export function createPayment(params: {
  wasteItemId: string;
  amount: number;
  method: PaymentMethod;
}): WastePayment {
  return {
    id: crypto.randomUUID(),
    wasteItemId: params.wasteItemId,
    amount: roundCurrency(params.amount),
    currency: "ZAR",
    method: params.method,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Determines if settlement is immediate
 */
export function isInstantPayment(method: PaymentMethod): boolean {
  return method === "CASH" || method === "IN_APP_WALLET";
}

/**
 * Utility for currency safety
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}