// Directory: src/features/collector/pages
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Scale, Clock3, ArrowRight, UserRound, CheckCircle2, Recycle, Truck,
} from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import TextField from '../../../shared/components/TextField';
import OtpModal from '../../../shared/components/OtpModal';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import type { CollectionRequest, WasteLineItem } from '../../../shared/types/collection';
import { mockRequests } from '../data/mockRequests';
import { COLLECTOR_SAMPLE_USER } from '../data/sampleCollector';

/**
 * B — Active route / weigh.
 *
 * THE WEIGH LEG of the collector's shared collection-JOB contract
 * (CollectionRequest / CollectionStatus — same model CollectorHomeScreen
 * drives, same mockRequests seed). It is deliberately NOT the collector
 * ACCOUNT lifecycle (CollectorApplicationStatus / CollectorPendingApproval)
 * and deliberately does NOT touch useAuth() — the collector build
 * (App.collector) has no AuthProvider, so any shared-auth hook here would
 * crash at runtime.
 *
 * Flow this screen owns (one truth source, mirrors the home tab's stepper):
 *   ACCEPTED --arrival OTP--> IN_PROGRESS --weigh/kgs--> COMPLETED
 *
 * The current IN_PROGRESS stop is the "Weigh" target: each WasteLineItem is
 * advanced from its household-estimated `estimatedKg` to the collector's
 * measured `actualKg` + `actualPricePerKg` (R/kg paid at the gate). Once
 * every line is weighed, the stop is COMPLETED and the next ACCEPTED stop
 * becomes weighable through the same arrival OTP.
 *
 * Self-contained on purpose: no useAuth() anywhere in this file.
 */

/** Collector cap on simultaneous active stops — collector app concern only. */
const MAX_ACTIVE_COLLECTIONS = 5; // mirrors ACTIVE_COLLECTION_STATUSES count at home
const ACTIVE: ReadonlySet<CollectionRequest['status']> = new Set(['ACCEPTED', 'IN_PROGRESS']);
const WAITING_FOR_WEIGH: CollectionRequest['status'] = 'IN_PROGRESS';
const COMPLETED: CollectionRequest['status'] = 'COMPLETED';

export default function ActiveRouteScreen() {
  const [requests, setRequests] = useState<CollectionRequest[]>(mockRequests);
  const [draftKg, setDraftKg] = useState<Record<string, string>>({});
  const [draftPrice, setDraftPrice] = useState<Record<string, string>>({});
  const [arrivalFor, setArrivalFor] = useState<CollectionRequest | null>(null);

  const stops = requests.filter((r) => ACTIVE.has(r.status));
  const current = stops.find((r) => r.status === WAITING_FOR_WEIGH) ?? stops[0];
  const isLast = stops.length === 0 || !current?.items.every((it) => typeof it.actualKg === 'number');

  const recordLine = (itemId: string, patch: Partial<WasteLineItem>) => {
    if (!current) return;
    setRequests((rs) =>
      rs.map((r) =>
        r.id === current.id
          ? { ...r, items: r.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : r
      )
    );
  };

  const advanceKg = (itemId: string) => {
    const kg = Number(draftKg[itemId]);
    if (Number.isFinite(kg) && kg > 0) recordLine(itemId, { actualKg: kg });
  };

  const advancePrice = (itemId: string) => {
    const price = Number(draftPrice[itemId]);
    if (Number.isFinite(price) && price >= 0) recordLine(itemId, { actualPricePerKg: price });
  };

  const completeStop = () => {
    if (!current) return;
    const hasAllWeights = current.items.every((it) => typeof it.actualKg === 'number');
    if (!hasAllWeights) return;
    setRequests((rs) => rs.map((r) => (r.id === current.id ? { ...r, status: COMPLETED } : r)));
  };

  const confirmArrivalOtp = async (code: string): Promise<boolean> => {
    if (!arrivalFor) return false;
    if (code !== '123456') return false;
    setRequests((rs) =>
      rs.map((r) => (r.id === arrivalFor.id ? { ...r, status: WAITING_FOR_WEIGH } : r))
    );
    setArrivalFor(null);
    return true;
  };

  const font = { fontFamily: DISPLAY_FONT.fontFamily, fontWeight: DISPLAY_FONT.fontWeight, color: COLORS.text };

  return (
    <AppLayout user={COLLECTOR_SAMPLE_USER}>
      <div className="pt-1 pb-2">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>Route &amp; weigh</p>
        <h1 className="text-[22px] font-semibold leading-tight" style={font}>
          Today's route
        </h1>
        <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
          <Clock3 size={11} /> {stops.length} active stop{stops.length === 1 ? '' : 's'} · {MAX_ACTIVE_COLLECTIONS - stops.length} slot{MAX_ACTIVE_COLLECTIONS - stops.length === 1 ? '' : 's'} left
        </p>
      </div>

      {/* Stop stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 mt-3">
        {stops.map((s, i) => {
          const done = s.status === COMPLETED;
          const currentStop = s.id === current?.id;
          const Icon = done ? CheckCircle2 : currentStop ? Scale : MapPin;
          return (
            <div key={s.id} className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: done ? `${COLORS.moss}22` : currentStop ? COLORS.moss : COLORS.border,
                  color: done || currentStop ? COLORS.text : COLORS.textMuted,
                }}
              >
                <Icon size={15} />
              </span>
              {i < stops.length - 1 && <span className="w-3 h-px" style={{ backgroundColor: COLORS.border }} />}
            </div>
          );
        })}
        {stops.length === 0 && (
          <p className="text-xs w-full text-center py-3" style={{ color: COLORS.textMuted }}>
            No active stops — accept a request from the queue first.
          </p>
        )}
      </div>

      {/* Current stop — the weigh row */}
      {current && (
        <div className="mt- droppable">
          <Card accent={current.status === WAITING_FOR_WEIGH ? COLORS.kraft : COLORS.border}>
            <div className="flex items-center gap-3">
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: current.status === WAITING_FOR_WEIGH ? `${COLORS.kraft}1f` : COLORS.border }}
              >
                {current.status === WAITING_FOR_WEIGH ? (
                  <Scale size={18} style={{ color: COLORS.kraft }} />
                ) : (
                  <Truck size={18} style={{ color: COLORS.textMuted }} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>{current.householdName}</p>
                <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: COLORS.textMuted }}>
                  <MapPin size={11} /> {current.suburb}
                </p>
              </div>
              <span className="text-xs font-semibold shrink-0" style={{ color: current.status === WAITING_FOR_WEIGH ? COLORS.kraft : COLORS.moss }}>
                {current.status === WAITING_FOR_WEIGH ? 'Weigh' : 'En route'}
              </span>
            </div>

            {/* Line-item weigh entry */}
            <div className="mt-3 space-y-2">
              {current.items.map((it) => (
                <div key={it.id} className="grid grid-cols-3 gap-2 items-end">
                  <div className="col-span-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: COLORS.text }}>{it.item}</p>
                    <p className="text-[11px] mt-0.5 flex items-center gap-1 truncate" style={{ color: COLORS.textMuted }}>
                      <Recycle size={10} className="shrink-0" /> {it.category}
                    </p>
                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: COLORS.textMuted }}>
                      est. {it.estimatedKg} kg
                    </p>
                  </div>
                  <TextField
                    label="Kg"
                    inputMode="decimal"
                    placeholder={String(it.estimatedKg)}
                    value={draftKg[it.id] ?? ''}
                    onChange={(ev) => setDraftKg((d) => ({ ...d, [it.id]: ev.target.value }))}
                  />
                  <TextField
                    label="R/kg"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={draftPrice[it.id] ?? ''}
                    onChange={(ev) => setDraftPrice((d) => ({ ...d, [it.id]: ev.target.value }))}
                  />
                  <div>
                    <Button variant="ghost" className="w-full" onClick={() => { advanceKg(it.id); advancePrice(it.id); }}>
                      Set
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button variant="secondary" className="flex-1" onClick={completeStop} disabled={!current.items.every((it) => typeof it.actualKg === 'number')}>
                {isLast ? 'Complete route' : 'Complete stop'}
              </Button>
              <Button variant="ghost" onClick={() => setArrivalFor(current)}>Arrive OTP</Button>
            </div>
            <p className="text-[11px] mt-2 text-center" style={{ color: COLORS.textMuted }}>
              {current.items.filter((it) => typeof it.actualKg === 'number').length} of {current.items.length} lines weighed
            </p>
          </Card>
        </div>
      )}

      {/* Next stops */}
      {stops.filter((s) => s.id !== current?.id).length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold mb-2" style={{ color: COLORS.textMuted }}>Next up</p>
          <div className="space-y-2">
            {stops.filter((s) => s.id !== current?.id).map((s) => (
              <Card key={s.id} accent={COLORS.border}>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.border }}>
                    <UserRound size={15} style={{ color: COLORS.textMuted }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>{s.householdName}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: COLORS.textMuted }}>{s.suburb}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: COLORS.textMuted }}>
                    {s.status === WAITING_FOR_WEIGH ? 'In progress' : 'Accepted'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link to="/tabs/route" className="text-xs font-semibold flex items-center gap-1" style={{ color: COLORS.moss }}>
          <ArrowRight size={11} /> Back to route
        </Link>
      </div>

      <OtpModal
        open={arrivalFor !== null}
        cellphone={arrivalFor ? COLLECTOR_SAMPLE_USER.cellphone : ''}
        otpHint="123456"
        successHref="/tabs/route"
        verifyOtp={confirmArrivalOtp}
        onClose={() => setArrivalFor(null)}
      />
    </AppLayout>
  );
}