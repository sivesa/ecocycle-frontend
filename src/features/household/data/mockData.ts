// Directory: src/features/household/data
/**
 * Centralised mock data for the EcoCycle household feature.
 * Every household screen pulls from here so demo state stays consistent.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type WasteItemStatus = 'pending' | 'verified' | 'completed';
export type PayoutMethod = 'cash' | 'wallet' | 'crypto';

export interface MockWasteItem {
  id: string;
  name: string;
  category: string;
  categoryId: 'metal' | 'glass' | 'paper' | 'plastic';
  weight: string;
  status: WasteItemStatus;
  date: string;
  color: string;
}

export interface MockBank {
  id: string;
  name: string;
  code: string;
}

export interface MockWalletTransaction {
  id: string;
  label: string;
  date: string;
  amount: number;
}

/* -------------------------------------------------------------------------- */
/*  Waste Inventory                                                           */
/* -------------------------------------------------------------------------- */

export const MOCK_WASTE_ITEMS: MockWasteItem[] = [
  { id: 'w1', name: 'Aluminium Can', category: 'Metal', categoryId: 'metal', weight: '2.4 kg', status: 'verified', date: 'Sep 8', color: '#6B7A8F' },
  { id: 'w2', name: 'Cardboard Box', category: 'Paper/Cardboard', categoryId: 'paper', weight: '5.1 kg', status: 'pending', date: 'Sep 5', color: '#C98A3B' },
  { id: 'w3', name: 'PET Bottle', category: 'Plastic', categoryId: 'plastic', weight: '1.2 kg', status: 'pending', date: 'Sep 2', color: '#4F8FBF' },
  { id: 'w4', name: 'Green Glass Bottle', category: 'Glass', categoryId: 'glass', weight: '3.8 kg', status: 'completed', date: 'Aug 28', color: '#4F8F63' },
  { id: 'w5', name: 'Copper Wire', category: 'Metal', categoryId: 'metal', weight: '1.6 kg', status: 'pending', date: 'Aug 25', color: '#6B7A8F' },
  { id: 'w6', name: 'Plastic Bags', category: 'Plastic', categoryId: 'plastic', weight: '0.8 kg', status: 'verified', date: 'Aug 22', color: '#4F8FBF' },
];

/* -------------------------------------------------------------------------- */
/*  Wallet                                                                    */
/* -------------------------------------------------------------------------- */

export const MOCK_BALANCE = 342.6;

export const MOCK_WALLET_TXS: MockWalletTransaction[] = [
  { id: 't1', label: 'Recycling payout — Aluminium Can', date: 'Sep 8', amount: 24.5 },
  { id: 't2', label: 'Recycling payout — Cardboard Box', date: 'Sep 5', amount: 18.0 },
  { id: 't3', label: 'Withdrawal to bank account', date: 'Sep 1', amount: -150.0 },
  { id: 't4', label: 'Recycling payout — PET Bottle', date: 'Aug 29', amount: 9.75 },
  { id: 't5', label: 'Recycling payout — Glass Bottle', date: 'Aug 26', amount: 15.35 },
  { id: 't6', label: 'Welcome bonus — Gold Recycler', date: 'Aug 20', amount: 50.0 },
];

/* -------------------------------------------------------------------------- */
/*  Banks                                                                     */
/* -------------------------------------------------------------------------- */

export const MOCK_BANKS: MockBank[] = [
  { id: 'fnb', name: 'First National Bank (FNB)', code: '250655' },
  { id: 'absa', name: 'Absa Bank', code: '632005' },
  { id: 'nedbank', name: 'Nedbank', code: '198765' },
  { id: 'standard', name: 'Standard Bank', code: '051001' },
];

/* -------------------------------------------------------------------------- */
/*  Collector verification OTP (mock)                                         */
/* -------------------------------------------------------------------------- */

export const WASTE_VERIFICATION_OTP = '482917';