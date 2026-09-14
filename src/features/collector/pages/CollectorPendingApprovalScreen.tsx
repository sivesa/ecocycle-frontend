// Directory: src/features/collector/pages
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock3, FileCheck2, BadgeCheck, ArrowRight, Gift } from 'lucide-react';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';

/**
 * Collector APPLICATION pending-approval landing (PENDING_REVIEW).
 *
 * IMPORTANT — repeatedly stressed in this codebase: this is the COLLECTOR
 * ACCOUNT application lifecycle (CollectorApplicationStatus in
 * collectorApplication.ts), NOT the collection-job lifecycle (CollectionStatus
 * in collection.ts / mockRequests.ts). Never conflate the two.
 *
 * This landing is deliberately self-contained: it does NOT call `useAuth()`
 * (the collector build, App.collector.tsx, wires no AuthProvider, so anything
 * touching shared useAuth would throw at runtime). Instead it mimics a backend
 * /applications/:id round-trip:
 *
 *   1. application lodged, status PENDING_REVIEW, reviewer window 24–72h
 *   2. three-step progress card (identity → business & legal → vehicle)
 *   3. dev-only shortcut: "Approve (dev)" flips it to APPROVED, then
 *      routes the collector into /tabs/queue (collector tab layout)
 *
 * successHref mirrors what OtpModal / CollectorSignInScreen use. The
 * APPROVED route is /tabs/queue (PickupQueueScreen) — the same landing the
 * sign-in OTP picks for an APPROVED collector.
 */

const REVIEW_STEPS: { id: string; title: string; detail: string }[] = [
  {
    id: 'identity',
    title: 'Identity & background check',
    detail: 'Cellphone number verified via OTP, ID document cross-checked against Home Affairs.',
  },
  {
    id: 'business',
    title: 'Business & CIPC verification',
    detail: 'Enterprise number matched against CIPC; company name and registration confirmed.',
  },
  {
    id: 'vehicle',
    title: 'Vehicle and capacity check',
    detail: 'Vehicle type and estimated load capacity reviewed against your profile.',
  },
];

export default function CollectorPendingApprovalScreen() {
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = (e: FormEvent) => {
    e.preventDefault();
    // Dev-only shortcut: approve this collector application instantly so the
    // demo can jump past the 24–72h wait into the collector queue.
    setApproved(true);
    setError(null);
  };

  return (
    <AuthLayout
      heading="Application under review"
      subheading="We've received everything — approval usually lands within 24–72 hours."
    >
      {approved ? (
        <div
          className="rounded-3xl border-2 p-5 text-center animate-[credIn_0.5s_cubic-bezier(0.22,1,0.36,1)]"
          style={{ borderColor: COLORS.moss, backgroundColor: `${COLORS.moss}0C` }}
        >
          <span
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: `${COLORS.moss}1A` }}
          >
            <Gift size={28} style={{ color: COLORS.moss }} />
          </span>
          <h2 className="text-lg font-semibold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
            You're approved — welcome!
          </h2>
          <p className="text-sm mt-1 mb-4" style={{ color: COLORS.textMuted }}>
            Your collector account is active. You can now see and accept{" "}
            <span className="font-semibold" style={{ color: COLORS.moss }}>collection requests</span> from households.
          </p>
          <Link to="/tabs/queue">
            <Button variant="primary" full icon={ArrowRight}>
              Go to my queue
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Status banner */}
          <div
            className="flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 mb-4"
            style={{ borderColor: `${COLORS.kraft}55`, backgroundColor: `${COLORS.kraft}0D` }}
          >
            <ShieldCheck size={22} style={{ color: COLORS.kraft }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Pending review
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: COLORS.textMuted }}>
                We'll SMS you the moment your application is approved. You can close this screen and come back — your
                application status stays saved.
              </p>
            </div>
          </div>

          {/* ETA + review steps */}
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold" style={{ color: COLORS.moss }}>
            <Clock3 size={16} />
            Typical turnaround: 24–72 hours
          </div>

          <div className="space-y-2.5">
            {REVIEW_STEPS.map((step, i) => (
              <div
                key={step.id}
                className="flex items-start gap-3 rounded-2xl border bg-white px-4 py-3"
                style={{ borderColor: COLORS.border }}
              >
                <span
                  className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: `${COLORS.moss}14`, color: COLORS.moss, ...DISPLAY_FONT }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{step.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: COLORS.textMuted }}>{step.detail}</p>
                </div>
                {i < REVIEW_STEPS.length - 1 ? (
                  <ArrowRight size={14} className="mt-1 shrink-0" style={{ color: COLORS.border }} />
                ) : (
                  <BadgeCheck size={16} className="mt-0.5 shrink-0" style={{ color: COLORS.moss }} />
                )}
              </div>
            ))}
          </div>

          {/* Dev-only approval shortcut */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: COLORS.textMuted }}>
                Demo shortcut
              </p>
              <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
            </div>
            <Button variant="secondary" full icon={FileCheck2} className="mt-3" onClick={handleApprove}>
              Approve immediately (dev)
            </Button>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: COLORS.textMuted }}>
              In a real build the backend reviewer approves this application. For the demo, tap here to skip the 24–72h
              wait and land in your collection queue.
            </p>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm mt-4 text-center" style={{ color: COLORS.danger }}>{error}</p>
      )}

      <p className="text-sm text-center mt-5" style={{ color: COLORS.textMuted }}>
        Applied with a different number?{' '}
        <Link to="/signin" style={{ color: COLORS.moss, fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}