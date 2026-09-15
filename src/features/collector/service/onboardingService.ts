// Directory: src/features/collector/service
import type { CollectorOnboardingRequest } from '../types/collectorOnboarding';
import type { RegistrationResponse } from '../../../shared/types/onboarding';

function mockDelay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

/**
 * POST /onboarding/collector — mocked for now, shaped to match
 * RegistrationResponseDto.basicSuccess() on the backend.
 *
 * Where this leads after OTP is still open: your CollectorSignUpScreen flow
 * (business docs upload → CollectorPendingApprovalScreen) and this
 * project's ActivationScreen (R150 fee, shared with household) both exist
 * in the codebase — confirm which comes first, or whether both apply, for
 * collector registration before wiring this up to a route redirect.
 */
export async function registerCollector(payload: CollectorOnboardingRequest): Promise<RegistrationResponse> {
  return mockDelay({
    userId: Math.floor(Math.random() * 100_000),
    phone: payload.phone,
    message: 'Registration initiated successfully. Please verify your phone number with the OTP we sent.',
    requiresOtpVerification: true,
    isActive: false,
    createdAt: new Date().toISOString(),
    referenceId: `REG-COL-${Math.random().toString(36).slice(2, 10)}`,
  });
}