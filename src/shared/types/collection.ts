/**
 * Shared collection-request model. Both the household app (requests a
 * pickup) and the collector app (accepts/weighs/completes it) consume the
 * SAME CollectionRequest — it lives in shared (not in either feature) so
 * the two features never drift on the contract.
 *
 * `status` mirrors the backend enum CollectionStatus verbatim:
 *   REQUESTED -> PENDING -> ACCEPTED -> IN_PROGRESS -> COMPLETED
 * any of which may instead go CANCELLED / REJECTED.
 */

/** Mirrors backend co.za.ecocycle.collection.model.enums.CollectionStatus. */
export type CollectionStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

/** One recyclable line on a request — counted/weighed per item. */
export interface WasteLineItem {
  id: string;
  category: string;
  item: string;
  /** Household's self-estimate at request time (kg). */
  estimatedKg: number;
  /** Collector's actual measured weight — set at weighing/screening. */
  actualKg?: number;
  /** Collector's actual price per kg paid — set at weighing/screening. */
  actualPricePerKg?: number;
}

export interface CollectionRequest {
  id: string;
  householdName: string;
  suburb: string;
  requestedAt: string;
  status: CollectionStatus;
  items: WasteLineItem[];
}

/** Active-statuses only: an accepted/in-progress job claims one of the
 * collector's 5 concurrent-collection slots. */
export const ACTIVE_COLLECTION_STATUSES: ReadonlySet<CollectionStatus> = new Set([
  'ACCEPTED',
  'IN_PROGRESS',
]);
