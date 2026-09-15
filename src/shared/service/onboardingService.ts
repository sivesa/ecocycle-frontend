// Directory: src/shared/services
import { apiClient } from './httpClient';
import type { VerifyOtpRequest, AuthResponseDto } from '../types/onboarding';
import type {
  ActivationPaymentInstructions,
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  CryptoQuoteResponse,
  CryptoVerifyRequest,
} from '../types/activation';

/** POST /api/auth/verify-otp — completes the household OTP login flow and
 * returns the issued JWT tokens + user metadata. */
export async function verifyOtp(request: VerifyOtpRequest): Promise<AuthResponseDto> {
  return apiClient.post('/api/auth/verify-otp', request, { auth: false });
}

/** GET /api/activation/instructions — generates (or reuses) the Nedbank
 * deposit instructions + unique payment reference for the current user. */
export async function requestDepositInstructions(): Promise<ActivationPaymentInstructions> {
  return apiClient.get('/api/activation/instructions');
}

/** POST /api/activation/paystack/initialize */
export async function initializePaystackCheckout(
  request: PaystackInitializeRequest,
): Promise<PaystackInitializeResponse> {
  return apiClient.post('/api/activation/paystack/initialize', request);
}

/** GET /api/activation/paystack/verify/{reference} — confirms a Paystack
 * transaction directly with the processor. Call this when the checkout
 * browser closes or the app regains focus. */
export async function verifyPaystackCheckout(reference: string): Promise<{ status: string }> {
  return apiClient.get(`/api/activation/paystack/verify/${encodeURIComponent(reference)}`);
}

/** POST /api/activation/crypto/quote — time-boxed ALGO conversion quote. */
export async function getCryptoQuote(): Promise<CryptoQuoteResponse> {
  return apiClient.post('/api/activation/crypto/quote', {});
}

/** POST /api/activation/crypto/verify */
export async function verifyCryptoPayment(
  request: CryptoVerifyRequest,
): Promise<{ verified: boolean }> {
  return apiClient.post('/api/activation/crypto/verify', request);
}

/** GET /api/activation/status */
export async function checkActivationStatus(): Promise<{ status: string }> {
  return apiClient.get('/api/activation/status');
}