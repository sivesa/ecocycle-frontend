// Directory: src/features/collector/data
import type { AppUser } from '../../../shared/types/user';

// Placeholder collector identity until collector auth/PIN exists. Passed to
// the shared AppLayout so every collector screen's header renders
// the collector's name/initials.
export const COLLECTOR_SAMPLE_USER: AppUser = {
  firstName: 'Zanele',
  lastName: 'Mokoena',
  cellphone: '0721230987',
  email: 'zanele.m@ecocycle.co.za',
};