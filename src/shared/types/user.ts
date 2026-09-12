export interface AppUser {
  firstName: string;
  lastName: string;
  cellphone: string;
  email: string;
}

/**
 * All fields captured by the shared household + collector registration form.
 * `$displayName` and `$householdDisplayName` style tokens aside, these are the
 * exact inputs — OTP is verified against the mock, then the R150 (activation)
 * fee is charged before the account is usable (see /activate).
 */
export interface SignUpFormData {
  /** First name as it will appear in the app and on the household/collector badge. */
  firstName: string;
  /** Last name / surname. */
  lastName: string;
  /** The registration cellphone — also used as the login identifier. */
  cellphone: string;
  /** Primary contact email (receives activation + payout notices). */
  email: string;
  /** South African ID number — used to anti-fraud-flag duplicate households. */
  idNumber: string;
  /** Physical street number of the household access point. */
  houseNumber: string;
  /** Street name. */
  streetName: string;
  /** Suburb / township the access point is located in. */
  suburbTownship: string;
  /** Municipality responsible for that suburb/township. */
  municipality: string;
  /** Postal code for the access point. */
  postalCode: string;
  /** Optional complex/building name (when access is in a gated estate). */
  complexBuildingName: string;
  /** Free-text notes for the collector reaching the access point. */
  accessNotes: string;
}
