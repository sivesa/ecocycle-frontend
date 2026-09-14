// Directory: src/features/household/pages
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Eye, EyeOff, KeyRound, Info } from 'lucide-react';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import OtpModal, { formatCellphone } from '../../../shared/components/OtpModal';
import { useAuth } from '../../../shared/context/AuthContext';
import { MOCK_USERS } from '../../../shared/data/mockUsers';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';

export function normalizeCellphone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length > 9) return '0' + digits.slice(2);
  return digits;
}

export default function LoginScreen({ successHref = '/tabs/home' }: { successHref?: string } = {}) {
  const { login, verifyOtp, pendingCellphone, cancelOtp, otpHint } = useAuth();

  const [cellphone, setCellphone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = login(normalizeCellphone(cellphone), password);
    if (!result.success) {
      setError(result.error ?? 'Unable to log in.');
    } else {
      setError(null);
    }
  };

  const fillCredentials = (phone: string, pass: string) => {
    setCellphone(phone);
    setPassword(pass);
    setError(null);
  };

  return (
    <AuthLayout heading="Welcome back" subheading="Log in to your household account">
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

      {/* Demo credentials */}
      <div className="mt-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: COLORS.textMuted }}>
            Demo households
          </p>
          <span className="h-px flex-1" style={{ backgroundColor: COLORS.border }} />
        </div>

        <div className="space-y-2">
          {MOCK_USERS.map((u, i) => {
            const initials = `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
            const entered = normalizeCellphone(cellphone) === u.cellphone;
            return (
              <button
                key={u.cellphone}
                type="button"
                onClick={() => fillCredentials(u.cellphone, u.password)}
                className="w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all duration-200 hover:border-moss animate-[credIn_0.5s_cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  borderColor: entered ? COLORS.moss : COLORS.border,
                  backgroundColor: entered ? `${COLORS.moss}08` : '#fff',
                  animationDelay: `${0.5 + i * 0.15}s`,
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
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="block text-xs truncate" style={{ color: COLORS.textMuted }}>
                    {formatCellphone(u.cellphone)} · {entered ? 'Selected ✓' : 'PW ••••••'}
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
          Tap any household to autofill, then press <span className="font-semibold">Continue</span>. After that you&apos;ll
          be asked for the demo OTP <span className="font-semibold" style={{ color: COLORS.kraft }}>
            {otpHint}
          </span>.
        </p>
      </div>

      <p className="text-sm text-center mt-6" style={{ color: COLORS.textMuted }}>
        Don&apos;t have an account?{' '}
        <Link to="/signup" style={{ color: COLORS.moss, fontWeight: 600 }}>
          Sign up
        </Link>
      </p>

      <OtpModal
        open={pendingCellphone !== null}
        cellphone={pendingCellphone ?? ''}
        otpHint={otpHint}
        successHref={successHref}
        verifyOtp={verifyOtp}
        onClose={cancelOtp}
      />
    </AuthLayout>
  );
}