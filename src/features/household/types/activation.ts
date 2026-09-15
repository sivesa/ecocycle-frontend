// Directory: src/features/household/types
// Re-exports the activation payment types from the shared layer so feature
// code can keep importing them from a familiar path. The authoritative
// definitions live at src/shared/types/activation.ts (shared code is not
// allowed to depend on src/features/**).
export type {
  ActivationPaymentStatus,
  ActivationPaymentInstructions,
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  CryptoQuoteResponse,
  CryptoVerifyRequest,
} from '../../../shared/types/activation';