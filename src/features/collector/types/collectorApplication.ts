import type { VehicleType } from './vehicle';

/**
 * Status of a COLLECTOR ACCOUNT's application to join the platform.
 *
 * IMPORTANT: this is the account-approval lifecycle (how the collector's
 * sign-up application is reviewed), NOT a collection job's lifecycle.
 * Collection lifecycle uses `CollectionStatus` (collectionStatus.ts).
 * These two enums must never be conflated or reused for each other.
 *
 * Mirrors backend `CollectorApplicationStatus`:
 *   PENDING_REVIEW -> APPROVED | REJECTED
 */
export type CollectorApplicationStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

/**
 * A collector's application to join the platform. Submitted during
 * sign-up, consumed by the PendingApprovalScreen (PENDING_REVIEW),
 * CollectorHome (APPROVED) and the sign-in routing gate.
 */
export interface CollectorApplication {
  id: string;
  /** Sign-up email the application was lodged under (links account ↔ app). */
  email: string;
  /** Display name saved once approval lands (collector's own full name). */
  applicantName: string;
  companyName: string;
  /**
   * CIPC enterprise number, format YYYY/NNNNNN/NN (e.g. "2024/012345/10").
   * Kept as free text — we don't validate CIPC structure in mock.
   */
  enterpriseNumber: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  /** Auto-set by the screen: mock OTP must match OTP_MOCK_CODE before lodging. */
  phoneVerified: boolean;
  status: CollectorApplicationStatus;
  /** True only when a dev-only action approved the application (see PendingApprovalScreen). */
  devApprovalUsed?: boolean;
  submittedAt: string;
  reviewedAt?: string;
}
