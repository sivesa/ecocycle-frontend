// Directory: src/features/household/service
import { apiClient } from '../../../shared/service/httpClient';
import type { HouseholdOnboardingRequest } from '../types/householdOnboarding';
import type { RegistrationResponse } from '../../../shared/types/onboarding';

/**
 * POST /api/onboarding/household — register a new household account.
 */
export async function registerHousehold(payload: HouseholdOnboardingRequest): Promise<RegistrationResponse> {
  return apiClient.post('/api/onboarding/household', payload, { auth: false });
}