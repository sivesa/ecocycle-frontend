// Directory: src/shared/types
/** Activation lifecycle states surfaced by /api/activation/status and
 * /api/activation/paystack/verify/{reference}. */
export type ActivationPaymentStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'CANCELLED';

/** Mirrors co.za.ecocycle.activation.dto.ActivationPaymentInstructionsDto */
export interface ActivationPaymentInstructions {
  paymentReference: string;
  amount: number;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;
  bankName: string;
  /** ISO timestamp — reference expires after this time. */
  expiresAt: string;
  instructions: string;
}

/** Mirrors co.za.ecocycle.activation.dto.PaystackInitializeRequestDto */
export interface PaystackInitializeRequest {
  /** Optional — backend falls back to the current user's email. */
  email?: string;
}

/** Mirrors co.za.ecocycle.activation.dto.PaystackInitializeResponseDto */
export interface PaystackInitializeResponse {
  reference: string;
  authorizationUrl: string;
  /** Only needed if resuming via Paystack Popup instead of a redirect. */
  accessCode?: string;
}

/** Mirrors co.za.ecocycle.activation.dto.CryptoQuoteResponseDto */
export interface CryptoQuoteResponse {
  reference: string;
  receiveAddress: string;
  amountMicroAlgos: number;
  zarPerAlgo: number;
  expiresAt: string;
}

/** Mirrors co.za.ecocycle.activation.dto.CryptoVerifyRequestDto */
export interface CryptoVerifyRequest {
  reference: string;
  txId: string;
  walletAddress: string;
  amountMicroAlgos: number;
}