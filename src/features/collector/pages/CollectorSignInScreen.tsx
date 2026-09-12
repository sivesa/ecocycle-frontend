import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Eye, EyeOff, KeyRound, Info, Truck } from 'lucide-react';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import OtpModal, { formatCellphone } from '../../../shared/components/OtpModal';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';

/**
 * Collector app sign-in.
 *
 * IMPORTANT: deliberately self-contained — it does NOT touch `useAuth()`.
 * The collector build (App.collector.tsx) currently has no AuthProvider, so
 * anything depending on shared useAuth would crash at runtime. Instead this
 * screen mimics a backend /oauth/login round-trip:
 *
 *   1. cellphone + password submit
 *   2. mock OTP modal (successHref chosen by the collector application status)
 *   3. APPROVED        → /tabs/queue   (into the collector tab layout)
 *      PENDING_REVIEW  → /pending      (pending-approval screen)
 *
 * This mirrors `CollectorApplicationStatus`; it is NOT the collection-job
 * lifecycle (see CollectionStatus / mockRequests.ts).
 */

/** Dev-only collector identities so the demo is one tap to fill. */
const DEMO_COLLECTORS: { label: string; cellphone: string; password: string; status: 'APPROVED' | 'PENDING_REVIEW' }[] =
  [
    { label: 'Zanele Mokoena', cellphone: '0721230987', password: 'ecocycle1', status: 'APPROVED' },
    { label: 'New applicant', cellphone: '0791112223', password: 'ecocycle1', status: 'PENDING_REVIEW' },
  ];

export default function CollectorSignInScreen() {
  const [cellphone, setCellphone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStage, setOtpStage] = useState<null | 'APPROVED' | 'PENDING_REVIEW'>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const demo = findDemoCollector(cellphone, password);
    if (!demo) {
      setError('Invalid cellphone number or password. Tap a demo collector below.');
      return;
    }
    setError(null);
    setOtpStage(demo.status);
  };

  const successHref = otpStage === 'PENDING_REVIEW' ? '/pending' : '/tabs/queue';

  return (
    <AuthLayout heading="Collector sign-in" subheading="Log in to your EcoCycle collecting account">
      <form onSubmit={handleSubmit} noValidate>
        {/* Cellphone */}
        <div className="mb-4">
          <label htmlFor="cellphone" className="text-sm mb-1 block font-medium" style={{ color: COLORS.textMuted }}>
            Cellphone number
          </label>
          <div
            className="group flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-moss"
            style={{ borderColor: COLORS.border, boxShadow: '0 1px 2px rgba(31,42,34,0.04)' }}
          >
            <span className="text-sm font-semibold py-1 pr-1 select-none" style={{ color: COLORS.textMuted }}>
              +27
            </span>
            <span className="h-5 w-px" style={{ backgroundColor: COLORS.border }} />
            <Phone size={16} className="opacity-40" style={{ color: COLORS.moss }} />
            <input
              id="cellphone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="82 123 4567"
              value={cellphone}
              onChange={(e) => {
                setCellphone(e.target.value.replace(/[^\d\s+]/g, ''));
                setError(null);
              }}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
              style={{ color: COLORS.text }}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
              Password
            </label>
          </div>
          <div
            className="group flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-moss"
            style={{ borderColor: COLORS.border, boxShadow: '0 1px 2px rgba(31,42,34,0.04)' }}
          >
            <KeyRound size={16} className="opacity-40" style={{ color: COLORS.moss }} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
              style={{ color: COLORS.text }}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="opacity-40 transition hover:opacity-70"
              style={{ color: COLORS.textMuted }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-2 text-sm animate-[otpFadeIn_0.3s_ease]"
            style={{ backgroundColor: `${COLORS.danger}12`, color: COLORS.danger }}
          >
            <Info size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" full className="mt-3">
          Continue
        </Button>
      </form>

      {/* Demo collector credentials */}
      <div className="mt-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: COLORS.textMuted }}>
            Demo collectors
          </p>
          <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
        </div>

        <div className="space-y-2">
          {DEMO_COLLECTORS.map((d) => {
            const entered = findDemoCollector(cellphone, password)?.cellphone === d.cellphone;
            const initials = d.label
              .split(' ')
              .map((w) => w.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <button
                key={d.cellphone}
                type="button"
                onClick={() => {
                  setCellphone(d.cellphone);
                  setPassword(d.password);
                  setError(null);
                }}
                className="w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all duration-200 hover:border-moss animate-[credIn_0.5s_cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  borderColor: entered ? COLORS.moss : COLORS.border,
                  backgroundColor: entered ? `${COLORS.moss}08` : '#fff',
                }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ backgroundColor: `${COLORS.moss}1A`, color: COLORS.moss, ...DISPLAY_FONT }}
                >
                  {initials}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate" style={{ color: COLORS.text }}>
                    {d.label}
                  </span>
                  <span className="block text-xs truncate" style={{ color: COLORS.textMuted }}>
                    {formatCellphone(d.cellphone)} · {d.status === 'APPROVED' ? 'Approved ✓' : 'Pending review'}
                  </span>
                </span>
                <span
                  className="text-[11px] font-bold uppercase tracking-wide shrink-0"
                  style={{ color: COLORS.kraft }}
                >
                  Tap to fill
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] mt-3 leading-relaxed" style={{ color: COLORS.textMuted }}>
          Tap a collector to autofill, then press <span className="font-semibold">Continue</span>. You&apos;ll get the
          mock OTP — an <span className="font-semibold" style={{ color: COLORS.kraft }}>Approved</span> collector lands
          on the queue, a <span className="font-semibold" style={{ color: COLORS.kraft }}>Pending review</span>{' '}
          applicant lands on approval status.
        </p>
      </div>

      <p className="text-sm text-center mt-6" style={{ color: COLORS.textMuted }}>
        New collector?{' '}
        <Link to="/signup" style={{ color: COLORS.moss, fontWeight: 600 }}>
          Apply to become one
        </Link>
      </p>

      <p className="flex items-center justify-center gap-1.5 text-[11px] mt-3" style={{ color: COLORS.textMuted }}>
        <Truck size={12} style={{ color: COLORS.moss }} />
        Demo PIN: none needed — OTP only
      </p>

      <OtpModal
        open={otpStage !== null}
        cellphone={cellphone}
        otpHint="123456"
        successHref={successHref}
        verifyOtp={() => true}
        onClose={() => setOtpStage(null)}
      />
    </AuthLayout>
  );
}

function findDemoCollector(
  cellphone: string,
  password: string
): (typeof DEMO_COLLECTORS)[number] | undefined {
  const digits = cellphone.replace(/\D/g, '');
  return DEMO_COLLECTORS.find((d) => d.cellphone.replace(/\D/g, '') === digits && d.password === password);
}
