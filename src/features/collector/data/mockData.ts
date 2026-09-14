// Directory: src/features/collector/data
/**
 * Centralised mock data for the EcoCycle collector feature.
 * Every collector screen pulls from here so demo state stays consistent.
 */

export type PickupStatus = 'assigned' | 'en-route' | 'arrived' | 'completed';

export interface PickupAssignment {
  id: string;
  householdName: string;
  address: string;
  item: string;
  category: string;
  categoryColor: string;
  estimatedKg: string;
  window: string;
  distanceKm: number;
  status: PickupStatus;
}

export interface CollectorPayout {
  id: string;
  label: string;
  date: string;
  amount: number;
}

export const COLLECTOR_BALANCE = 1287.4;

export const MOCK_PICKUPS: PickupAssignment[] = [
  {
    id: 'p1',
    householdName: "Nkosi's household",
    address: '12 Protea Road, Soweto',
    item: 'Aluminium Can',
    category: 'Metal',
    categoryColor: '#6B7A8F',
    estimatedKg: '2.4 kg',
    window: '09:00 - 10:00',
    distanceKm: 1.2,
    status: 'en-route',
  },
  {
    id: 'p2',
    householdName: "Dlamini's household",
    address: '45 Jacaranda Street, Soweto',
    item: 'PET Bottle',
    category: 'Plastic',
    categoryColor: '#4F8FBF',
    estimatedKg: '1.2 kg',
    window: '10:30 - 11:30',
    distanceKm: 2.1,
    status: 'assigned',
  },
  {
    id: 'p3',
    householdName: "Mokoena's household",
    address: '8 Acacia Close, Soweto',
    item: 'Cardboard Box',
    category: 'Paper/Cardboard',
    categoryColor: '#C98A3B',
    estimatedKg: '5.1 kg',
    window: '13:00 - 14:00',
    distanceKm: 3.4,
    status: 'assigned',
  },
  {
    id: 'p4',
    householdName: "Pillay's household",
    address: '29 Willow Avenue, Soweto',
    item: 'Green Glass Bottle',
    category: 'Glass',
    categoryColor: '#4F8F63',
    estimatedKg: '3.8 kg',
    window: '14:30 - 15:30',
    distanceKm: 4.0,
    status: 'assigned',
  },
];

export const MOCK_PAYOUTS: CollectorPayout[] = [
  { id: 'c1', label: 'Collection payout — Aluminium Can', date: 'Sep 8', amount: 68.4 },
  { id: 'c2', label: 'Collection payout — Cardboard Box', date: 'Sep 5', amount: 41.2 },
  { id: 'c3', label: 'Withdrawal to bank account', date: 'Sep 1', amount: -500.0 },
  { id: 'c4', label: 'Collection payout — PET Bottle', date: 'Aug 29', amount: 28.75 },
  { id: 'c5', label: 'Collection payout — Glass Bottle', date: 'Aug 26', amount: 34.6 },
  { id: 'c6', label: 'Weekly route bonus', date: 'Aug 20', amount: 120.0 },
];