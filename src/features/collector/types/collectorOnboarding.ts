// Directory: src/features/collector/types
// Adjust this import if your existing vehicle.ts exports a differently-named
// type or label map — see features/collector/types/vehicle.ts.
// import type { VehicleType } from './vehicle';

/** Mirrors co.za.ecocycle.onboarding.dto.CollectorOnboardingDto exactly.
 * Collector-only — household's equivalent is
 * features/household/types/householdOnboarding.ts. Note email is REQUIRED
 * here (@NotBlank on the backend), unlike household's optional email. */
export interface CollectorOnboardingRequest {
  phone: string;
  email: string;
  companyName: string;
  /** CIPC format YYYY/NNNNNN/XX, e.g. "2024/012345/07". */
  enterpriseNumber: string;
  /** Backend accepts a free-text string; map your VehicleType label onto this. */
  vehicleType?: string;
  /** Long on the backend — send as a number, not a numeric string. */
  premisesNumber: number;
  streetName: string;
  suburbArea: string;
  municipality: string;
  postalCode: string;
  complexBuildingName?: string;
  accessNotes?: string;
}