// Design tokens for the EcoCycle household app.
// Kept as plain TS (not just Tailwind config) so components can reuse them
// inline for things Tailwind's static classes can't express (dynamic accent
// colors per waste category, chart fills, etc).

import type { CSSProperties } from 'react';

export const COLORS = {
  bg: '#EFF3EE', // app background — light sage, not plain white
  card: '#FFFFFF',
  text: '#1F2A22', // near-black with a green undertone
  textMuted: '#5B6B60',
  moss: '#335C40', // primary brand green (collections)
  mossLight: '#4F8F63', // positive trend / glass category
  kraft: '#C98A3B', // amber — paper/cardboard, pending pickups
  steel: '#6B7A8F', // metal category
  sky: '#4F8FBF', // recycling impact / plastic category
  danger: '#C4553D', // negative trend
  border: '#E1E8E0',
} as const;

export type ColorToken = keyof typeof COLORS;

// Space Grotesk for numbers/headings (matches the EcoCycle admin dashboard
// brand type); body text uses Tailwind's default sans stack.
export const DISPLAY_FONT: CSSProperties = { fontFamily: '"Space Grotesk", sans-serif' };

export type WasteCategoryId = 'metal' | 'glass' | 'paper' | 'plastic';

export interface WasteCategory {
  id: WasteCategoryId;
  label: string;
  color: string;
  items: string[];
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'metal',
    label: 'Metal',
    color: COLORS.steel,
    items: ['Aluminium Can', 'Copper Wire', 'Steel Scrap', 'Tin Can'],
  },
  {
    id: 'glass',
    label: 'Glass',
    color: COLORS.mossLight,
    items: ['Clear Glass Bottle', 'Green Glass Bottle', 'Brown Glass Bottle'],
  },
  {
    id: 'paper',
    label: 'Paper/Cardboard',
    color: COLORS.kraft,
    items: ['Cardboard Box', 'Newspaper', 'Office Paper', 'Egg Carton'],
  },
  {
    id: 'plastic',
    label: 'Plastic',
    color: COLORS.sky,
    items: ['PET Bottle', 'HDPE Container', 'Plastic Bags', 'Bottle Caps'],
  },
];

export interface LoggedWasteItem {
  name: string;
  category: string;
  qty: string;
  date: string;
  color: string;
}

export interface MonthlyWaste {
  month: string;
  kg: number;
}
