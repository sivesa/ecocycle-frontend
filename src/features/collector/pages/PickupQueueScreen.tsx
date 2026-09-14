// Directory: src/features/collector/pages
import { useState } from 'react';
import { MapPin, Clock, Truck, CheckCircle2, Navigation } from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import { COLLECTOR_SAMPLE_USER } from '../data/sampleCollector';
import {
  MOCK_PICKUPS,
  type PickupAssignment,
  type PickupStatus,
} from '../data/mockData';

const STATUS_CONFIG: Record<PickupStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: 'Assigned', color: COLORS.kraft, bg: `${COLORS.kraft}14` },
  'en-route': { label: 'En route', color: COLORS.sky, bg: `${COLORS.sky}14` },
  arrived: { label: 'Arrived', color: COLORS.mossLight, bg: `${COLORS.mossLight}14` },
  completed: { label: 'Completed', color: COLORS.moss, bg: `${COLORS.moss}14` },
};

function StatusChip({ status }: { status: PickupStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {status === 'completed' ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <Truck size={12} strokeWidth={2.5} />}
      {cfg.label}
    </span>
  );
}

function PickupCard({
  pickup,
  onStart,
}: {
  pickup: PickupAssignment;
  onStart: (id: string) => void;
}) {
  const actionable = pickup.status === 'assigned' || pickup.status === 'en-route';
  return (
    <Card accent={pickup.categoryColor}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${pickup.categoryColor}14` }}
        >
          <span
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: pickup.categoryColor }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold truncate" style={{ color: COLORS.text }}>
              {pickup.householdName}
            </p>
            <StatusChip status={pickup.status} />
          </div>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: COLORS.textMuted }}>
            {pickup.item} · {pickup.category}
          </p>
          <p className="text-[12px] mt-1.5 flex items-center gap-1" style={{ color: COLORS.textMuted }}>
            <MapPin size={12} strokeWidth={2.2} /> {pickup.address}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: COLORS.textMuted }}>
              Est. weight
            </p>
            <p className="text-[13px] font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {pickup.estimatedKg}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: COLORS.textMuted }}>
              Distance
            </p>
            <p className="text-[13px] font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {pickup.distanceKm.toFixed(1)} km
            </p>
          </div>
        </div>

        {actionable && (
          <Button
            variant="primary"
            onClick={() => onStart(pickup.id)}
            icon={Navigation}
            className="!px-4 !py-2 !text-[12px]"
          >
            Continue
          </Button>
        )}
      </div>

      {actionable && (
        <p className="text-[11px] mt-3 flex items-center gap-1 font-medium" style={{ color: COLORS.textMuted }}>
          <Clock size={12} strokeWidth={2.2} /> Pickup window: {pickup.window}
        </p>
      )}
    </Card>
  );
}

export default function PickupQueueScreen() {
  const [pickups, setPickups] = useState<PickupAssignment[]>(MOCK_PICKUPS);

  const handleStart = (id: string) => {
    setPickups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'assigned' ? ('en-route' as PickupStatus) : p.status } : p))
    );
  };

  const activeCount = pickups.filter((p) => p.status !== 'completed').length;
  const totalKg = pickups
    .filter((p) => p.status !== 'completed')
    .reduce((sum, p) => sum + parseFloat(p.estimatedKg), 0);

  return (
    <AppLayout user={COLLECTOR_SAMPLE_USER}>
      <div className="pt-1 pb-2">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Your schedule today
        </p>
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Pickup Queue
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card accent={COLORS.sky}>
          <p className="text-[28px] font-bold leading-none" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
            {activeCount}
          </p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS.textMuted }}>
            Pickups remaining
          </p>
        </Card>
        <Card accent={COLORS.mossLight}>
          <p className="text-[28px] font-bold leading-none" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
            {totalKg.toFixed(1)} kg
          </p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS.textMuted }}>
            Est. weight to collect
          </p>
        </Card>
      </div>

      <div className="space-y-2">
        {pickups.map((p) => (
          <PickupCard key={p.id} pickup={p} onStart={handleStart} />
        ))}
      </div>
    </AppLayout>
  );
}