// Directory: src/shared/data
import type { AppUser } from '../types/user';

export interface MockHouseholdUser extends AppUser {
  password: string;
  householdName: string;
}

/**
 * Mock household credentials for development.
 * Login: cellphone number + password.
 * OTP is always verified against the constant OTP_MOCK_CODE below.
 */
export const MOCK_USERS: MockHouseholdUser[] = [
  {
    firstName: 'Thabo',
    lastName: 'Nkosi',
    cellphone: '0821234567',
    email: 'thabo.nkosi@example.com',
    password: 'ecocycle1',
    householdName: "Thabo's household",
  },
  {
    firstName: 'Naledi',
    lastName: 'Mokoena',
    cellphone: '0739876543',
    email: 'naledi.mokoena@example.com',
    password: 'ecocycle2',
    householdName: "Naledi's household",
  },
  {
    firstName: 'Sipho',
    lastName: 'Dlamini',
    cellphone: '0614567890',
    email: 'sipho.dlamini@example.com',
    password: 'ecocycle3',
    householdName: "Sipho's household",
  },
];

/**
 * The constant OTP code used to "verify" during mock authentication.
 * Any 6-digit entry matching this value will be accepted.
 */
export const OTP_MOCK_CODE = '123456';

/**
 * Simulate an API call to look up a user by cellphone number.
 */
export function findUserByCellphone(cellphone: string): MockHouseholdUser | undefined {
  return MOCK_USERS.find((u) => u.cellphone === cellphone);
}

/**
 * Simulate password validation against the mock data.
 */
export function validateCredentials(cellphone: string, password: string): MockHouseholdUser | null {
  const user = findUserByCellphone(cellphone);
  if (user && user.password === password) {
    return user;
  }
  return null;
}