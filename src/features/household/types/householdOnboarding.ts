// Directory: src/features/household/types
/** Mirrors co.za.ecocycle.onboarding.dto.HouseholdOnboardingDto exactly.
 * Household-only — collector's equivalent lives at
 * features/collector/types/collectorOnboarding.ts with a different field
 * set (business/address fields instead of personal ones). */
export interface HouseholdOnboardingRequest {
  phone: string;
  /** Optional on the backend (no @NotBlank) — unlike collector's, which is required. */
  email?: string;
  firstName: string;
  lastName: string;
  /** Exactly 13 digits — backend validates with ^[0-9]{13}$. */
  idNumber: string;
  /** Long on the backend — send as a number, not a numeric string. */
  houseNumber: number;
  streetName: string;
  citySuburbTownship: string;
  municipality: string;
  postalCode: string;
  complexBuildingName?: string;
  accessNotes?: string;
}