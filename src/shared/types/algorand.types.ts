// Directory: src/shared/types
export type CryptoPaymentStatus =
  | "idle"
  | "connecting-wallet"
  | "quoting"
  | "awaiting-signature"
  | "submitting"
  | "verifying"
  | "success"
  | "failed";

export interface AlgoQuote {
  amountMicroAlgos: number;
  algoPerZar: number;
  quotedAt: number;
}

export interface VerifyCryptoPaymentRequest {
  reference: string;
  txId: string;
  walletAddress: string;
  amountMicroAlgos: number;
}

export interface VerifyCryptoPaymentResponse {
  status: "success" | "failed" | "pending";
  txId: string;
  confirmedRound?: number;
}