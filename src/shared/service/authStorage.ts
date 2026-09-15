// Directory: src/shared/services
// src/services/authStorage.ts
//
// Minimal storage for the JWT issued by /api/auth/verify-otp
// (AuthServiceImpl.buildAuthResponse -> accessToken/refreshToken).
// SecurityConfig authenticates non-/api/auth, non-/api/onboarding
// requests via a Bearer token (JwtAuthenticationFilter), so anything
// called after OTP verification — like /api/activation/instructions —
// needs this attached as an Authorization header.

const ACCESS_TOKEN_KEY = "ecocycle_access_token";
const REFRESH_TOKEN_KEY = "ecocycle_refresh_token";

export function storeAuthTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Convenience for building fetch headers on authenticated calls. */
export function authHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}