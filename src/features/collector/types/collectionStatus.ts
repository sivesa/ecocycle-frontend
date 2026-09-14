// Directory: src/features/collector/types
/**
 * Lifecycle of a single collection (pickup) — mirrors the backend enum
 * one-for-one (do not rename/reorder):
 *
 *   java co.za.ecocycle.collection.model.enums.CollectionStatus
 *
 *   REQUESTED  -> PENDING  -> ACCEPTED -> IN_PROGRESS -> COMPLETED
 *                  \-> CANCELLED / REJECTED
 *
 * The collector app only ever drives: REQUESTED (available to accept),
 * ACCEPTED (arrival OTP), IN_PROGRESS (weighing/screening) and
 * COMPLETED. CANCELLED/REJECTED exist for backend parity and are not
 * triggered by collector UI today.
 */
export type CollectionStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

/** Maximum simultaneous active collections the collector may hold. */
export const MAX_ACTIVE_COLLECTIONS = 5;