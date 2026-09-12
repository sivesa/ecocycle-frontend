import type { CollectionRequest, WasteLineItem } from '../../../shared/types/collection';

/**
 * Mock requests for the collector's "New requests" + "My active
 * collections" lists. Seed state is deliberately a mix so BOTH sections
 * have content on first load:
 *
 *   - 5 x REQUESTED     → appear under "New requests" (accept-able)
 *   - 1 x ACCEPTED      → active collection, "Confirm Arrival" action
 *   - 1 x IN_PROGRESS    → active collection, "Weigh & Complete" action
 *
 * Collector applications go in sampleCollector.ts / mockCollector — NOT
 * here. Requests live separately from the collector's account data.
 */

function item(
  id: string,
  itemName: string,
  category: string,
  estimatedKg: number,
  actualKg?: number,
  actualPricePerKg?: number
): WasteLineItem {
  return {
    id,
    category,
    item: itemName,
    estimatedKg,
    ...(actualKg !== undefined ? { actualKg } : {}),
    ...(actualPricePerKg !== undefined ? { actualPricePerKg } : {}),
  };
}

export const mockRequests: CollectionRequest[] = [
  {
    id: 'req-1001',
    householdName: 'Thandi Ndlovu',
    suburb: 'Diepsloot',
    requestedAt: '2026-09-11T08:20:00Z',
    status: 'REQUESTED',
    items: [
      item('req-1001-1', 'Glass bottles', 'Glass', 2.5),
      item('req-1001-2', 'Cardboard boxes', 'Paper & Cardboard', 3.0),
    ],
  },
  {
    id: 'req-1002',
    householdName: 'Sipho Mokoena',
    suburb: 'Midrand',
    requestedAt: '2026-09-11T09:05:00Z',
    status: 'REQUESTED',
    items: [item('req-1002-1', 'Tin / steel cans', 'Metal', 1.8)],
  },
  {
    id: 'req-1003',
    householdName: 'Lerato Khumalo',
    suburb: 'Ivory Park',
    requestedAt: '2026-09-11T10:40:00Z',
    status: 'REQUESTED',
    items: [
      item('req-1003-1', 'Mixed plastics', 'Plastic', 4.2),
      item('req-1003-2', 'PET bottles', 'Plastic', 1.1),
    ],
  },
  {
    id: 'req-1004',
    householdName: 'Johan Botha',
    suburb: 'Kyalami',
    requestedAt: '2026-09-11T11:55:00Z',
    status: 'REQUESTED',
    items: [item('req-1004-1', 'Newsprint / magazines', 'Paper & Cardboard', 5.0)],
  },
  {
    id: 'req-1005',
    householdName: 'Naledi Dlamini',
    suburb: 'Tembisa',
    requestedAt: '2026-09-11T13:15:00Z',
    status: 'REQUESTED',
    items: [
      item('req-1005-1', 'Aluminium cans', 'Metal', 0.9),
      item('req-1005-2', 'Glass jars', 'Glass', 3.4),
    ],
  },
  {
    id: 'req-1006',
    householdName: 'Pieter van Wyk',
    suburb: 'Halfway House',
    requestedAt: '2026-09-11T07:30:00Z',
    status: 'ACCEPTED',
    items: [item('req-1006-1', 'Cardboard', 'Paper & Cardboard', 6.2)],
  },
  {
    id: 'req-1007',
    householdName: 'Zanele Zulu',
    suburb: 'Sunninghill',
    requestedAt: '2026-09-10T16:00:00Z',
    status: 'IN_PROGRESS',
    items: [
      item('req-1007-1', 'Glass bottles', 'Glass', 2.0),
      item('req-1007-2', 'HDPE containers', 'Plastic', 2.8),
    ],
  },
];
