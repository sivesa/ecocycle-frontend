import { COLORS } from '../theme/tokens';
import type { CollectionStatus } from '../types/collection';

/**
 * Human labels + accent colors per collection-job status. Kept in an
 * explicit map (not derived from the enum string) so the UI copy and the
 * backend enum values never drift, and so collectors/households see the
 * same tone ("Requested", "Accepted", …) everywhere a request is shown.
 */
const STATUS_META: Record<CollectionStatus, { label: string; color: string }> = {
  REQUESTED: { label: 'Requested', color: COLORS.kraft },
  PENDING: { label: 'Pending', color: COLORS.kraft },
  ACCEPTED: { label: 'Accepted', color: COLORS.moss },
  IN_PROGRESS: { label: 'In progress', color: COLORS.moss },
  COMPLETED: { label: 'Completed', color: COLORS.sky },
  CANCELLED: { label: 'Cancelled', color: COLORS.danger },
  REJECTED: { label: 'Rejected', color: COLORS.danger },
};

interface StatusBadgeProps {
  status: CollectionStatus;
  className?: string;
}

/** Small colored pill representing a collection job's current status. */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { label, color } = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ color, backgroundColor: `${color}1A`, border: `1px solid ${color}33` }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }} />
      {label}
    </span>
  );
}
