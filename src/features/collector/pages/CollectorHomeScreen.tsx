// Directory: src/features/collector/pages
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, MapPin, Scale, Clock3, ArrowRight, UserRound, Truck,
} from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import OtpModal, { formatCellphone } from '../../../shared/components/OtpModal';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import type { CollectionRequest } from '../../../shared/types/collection';
import { ACTIVE_COLLECTION_STATUSES } from '../../../shared/types/collection';
import { mockRequests } from '../data/mockRequests';
import { COLLECTOR_SAMPLE_USER } from '../data/sampleCollector';

/**
 * Collector home — the APPROVED collector's landing tab (/tabs/home).
 *
 * This is the COLLECTION-JOB lifecycle (CollectionStatus / CollectionRequest):
 * the pickup work a collector drives once their account is APPROVED. It is NOT
 * the collector-account application lifecycle (CollectorApplicationStatus —
 * see CollectorPendingApprovalScreen).
 *
 * Deliberately self-contained: does NOT touch useAuth() because the collector
 * build (App.collector.tsx) has no AuthProvider and would crash at runtime.
 * Acceptance is capped at MAX_ACTIVE_COLLECTIONS (the shared mock bus cap),
 * and ACCEPTED is advanced to IN_PROGRESS through the shared OtpModal
 * arrival-verification flow.
 */

const MAX_ACTIVE_COLLECTIONS = 5;

export default function CollectorHomeScreen() {
  const [requests, setRequests] = useState<CollectionRequest[]>(mockRequests);
  const [arrivalFor, setArrivalFor] = useState<CollectionRequest | null>(null);

  const active = requests.filter((r) => ACTIVE_COLLECTION_STATUSES.has(r.status));
  const newRequests = requests.filter((r) => r.status === 'REQUESTED');
  const openSlots = Math.max(0, MAX_ACTIVE_COLLECTIONS - active.length);

  const accept = (r: CollectionRequest) => {
    if (openSlots === 0) return;
    setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'ACCEPTED' as const } : x)));
  };

  const confirmArrivalOtp: (code: string) => Promise<boolean> = async (code) => {
    if (code === '123456' && arrivalFor) {
      const id = arrivalFor.id;
      setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: 'IN_PROGRESS' as const } : x)));
      return true;
    }
    return false;
  };

  const h1 = { fontFamily: DISPLAY_FONT.fontFamily, fontWeight: DISPLAY_FONT.fontWeight, color: COLORS.text };

  return (
    <AppLayout user={COLLECTOR_SAMPLE_USER}>
      {/* Active cap */}
      <div className="flex items-center justify-between">
        <h1 style={h1}>
          Good day, {COLLECTOR_SAMPLE_USER.firstName}
        </h1>
        <span className="text-xs font-semibold" style={{ color: COLORS.kraft }}>
          {active.length}/{MAX_ACTIVE_COLLECTIONS} active
        </span>
      </div>
      <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
        {openSlots} open slot{openSlots === 1 ? '' : 's'} — accept a new request to start a pick-up.
      </p>

      {/* New requests */}
      <div className="flex items-center justify-between mt-7 mb-2">
        <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>New requests</h2>
        <span className="text-xs" style={{ color: COLORS.textMuted }}>{newRequests.length}</span>
      </div>
      <div className="space-y-2.5">
        {newRequests.slice(0, Math.max(0, openSlots)).map((r) => (
          <Card key={r.id} accent={COLORS.border}>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.border }}>
                <Truck size={18} style={{ color: COLORS.moss }} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>{r.householdName}</p>
                <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: COLORS.textMuted }}>
                  <MapPin size={11} className="shrink-0" /> {r.suburb}
                </p>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.textMuted }}>
                  <Clock3 size={11} /> {r.requestedAt}
                </p>
              </div>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.border }}>
                <UserRound size={16} style={{ color: COLORS.text }} />
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="primary" onClick={() => accept(r)}>Accept</Button>
            </div>
          </Card>
        ))}
        {newRequests.length === 0 && (
          <Card accent={COLORS.border}>
            <p className="text-sm text-center py-2" style={{ color: COLORS.textMuted }}>
              No new requests right now.
            </p>
          </Card>
        )}
      </div>

      {/* Active collections */}
      <div className="flex items-center justify-between mt-7 mb-2">
        <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>My collections</h2>
        <Link to="/tabs/route" className="text-xs font-semibold flex items-center gap-1" style={{ color: COLORS.moss }}>
          Route <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-2.5">
        {active.map((r) => (
          <Card key={r.id} accent={r.status === 'IN_PROGRESS' ? COLORS.kraft : COLORS.border}>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: r.status === 'IN_PROGRESS' ? COLORS.kraft : COLORS.border }}>
                {r.status === 'IN_PROGRESS' ? (
                  <Scale size={18} style={{ color: COLORS.text }} />
                ) : (
                  <CheckCircle2 size={18} style={{ color: COLORS.moss }} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>{r.householdName}</p>
                <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: COLORS.textMuted }}>
                  <MapPin size={11} className="shrink-0" /> {r.suburb}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold" style={{ color: r.status === 'IN_PROGRESS' ? COLORS.kraft : COLORS.moss }}>
                    {r.status === 'IN_PROGRESS' ? 'In progress' : 'Accepted'}
                  </span>
                </div>
                {r.status === 'ACCEPTED' && (
                  <Button variant="ghost" onClick={() => setArrivalFor(r)}>Arrive</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {active.length === 0 && (
          <Card accent={COLORS.border}>
            <p className="text-sm text-center py-2" style={{ color: COLORS.textMuted }}>
              No active collections yet.
            </p>
          </Card>
        )}
      </div>

      <OtpModal
        open={arrivalFor !== null}
        cellphone={arrivalFor ? formatCellphone(COLLECTOR_SAMPLE_USER.cellphone) : ''}
        otpHint="123456"
        successHref="/tabs/queue"
        verifyOtp={confirmArrivalOtp}
        onClose={() => setArrivalFor(null)}
      />
    </AppLayout>
  );
}