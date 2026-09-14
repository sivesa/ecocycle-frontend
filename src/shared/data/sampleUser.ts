// Directory: src/shared/data
import type { AppUser } from '../types/user';

// Placeholder until real auth/session state exists. AppLayout uses this as
// the default `user` prop for every screen's header.
export const SAMPLE_USER: AppUser = {
  firstName: 'Thabo',
  lastName: 'Nkosi',
  cellphone: '0821234567',
  email: 'thabo.nkosi@example.com',
};