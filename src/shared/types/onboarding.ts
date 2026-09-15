// Directory: src/shared/types
/** Mirrors co.za.ecocycle.auth.dto.VerifyOtpRequestDto — used by both the
 * household and collector registration flows. */
export interface VerifyOtpRequest {
  phone: string;
  otpCode: string;
  /** Optional — request_id from the SMS provider (SMSFlow currently). */
  requestId?: string;
}

/** Mirrors co.za.ecocycle.onboarding.dto.RegistrationResponseDto — returned
 * by both registerHousehold() and registerCollector(). */
export interface RegistrationResponse {
  userId: number;
  phone: string;
  message: string;
  requiresOtpVerification: boolean;
  isActive: boolean;
  /** ISO timestamp (backend serializes as yyyy-MM-dd'T'HH:mm:ss.SSSXXX). */
  createdAt: string;
  referenceId?: string;
}

/** Mirrors co.za.ecocycle.auth.dto.AuthResponseDto — returned by
 * POST /api/auth/verify-otp (household OTP login completion) and by
 * POST /api/auth/authenticate (collector password login). */
export interface AuthResponseDto {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  /** Mirrors the current-user light payload returned alongside tokens. */
  user?: AuthUserDto;
  /** For the OTP flow: true while waiting for the household to submit the code. */
  requiresOtpVerification?: boolean;
}

/** Mirrors co.za.ecocycle.auth.dto.AuthUserDto / CurrentUserLightDto fields
 * surfaced on a successful verify-otp response. */
export interface AuthUserDto {
  id: number;
  phone: string;
  roles: string[];
  active: boolean;
  profileComplete: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}