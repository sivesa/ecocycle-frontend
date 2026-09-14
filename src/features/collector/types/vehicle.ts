// Directory: src/features/collector/types
/**
 * Vehicle types a collector may use. This list is authoritative for the
 * collector sign-up vehicle-type dropdown — do not rename values without
 * a matching backend change.
 */
export type VehicleType =
  | 'BICYCLE'
  | 'HANDCART'
  | 'BAKKIE_LDV'
  | 'VAN'
  | 'TRUCK'
  | 'OTHER';

/** Human labels keyed by the same values the backend stores. */
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  BICYCLE: 'Bicycle',
  HANDCART: 'Handcart',
  BAKKIE_LDV: 'Bakkie / LDV',
  VAN: 'Van',
  TRUCK: 'Truck',
  OTHER: 'Other',
};

/** Select options (value + label) derived from the authoritative map. */
export const VEHICLE_TYPE_OPTIONS = (Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map(
  (value) => ({ value, label: VEHICLE_TYPE_LABELS[value] })
);