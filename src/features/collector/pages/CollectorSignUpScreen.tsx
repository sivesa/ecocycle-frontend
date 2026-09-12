import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { User, Eye, EyeOff, Info, Truck, Upload } from 'lucide-react';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import OtpModal, { formatCellphone } from '../../../shared/components/OtpModal';
import { COLORS } from '../../../shared/theme/tokens';
import { VEHICLE_TYPE_LABELS, VEHICLE_TYPE_LABELS as _VTL } from '../types/vehicle';

/**
 * Collector application (sign-up).
 *
 * IMPORTANT: deliberately self-contained — it does NOT touch `useAuth()`.
 * The collector build (App.collector.tsx) has no AuthProvider, so anything
 * depending on shared useAuth would crash at runtime. This screen mimics a
 * backend /applications/register round-trip:
 *
 *   1. personal + business & legal + vehicle fields
 *   2. mock OTP (OtpModal) before the application is lodged
 *   3. successHref chosen by the resulting application status:
 *        PENDING_REVIEW  → /pending  (pending-approval screen)
 *
 * This mirrors `CollectorApplicationStatus` (collectorApplication.ts) — the
 * COLLECTOR ACCOUNT approval lifecycle. It is NOT the collection-job
 * lifecycle (see CollectionStatus / mockRequests.ts).
 */

export default function CollectorSignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [enterpriseNumber, setEnterpriseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('VAN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStage, setOtpStage] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !firstName.trim() || !lastName.trim() || !email.trim() || !cellphone.trim() ||
      !password || !confirmPassword || !companyName.trim() || !enterpriseNumber.trim()
    ) {
      setError('Please complete every field before lodging your application.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match — please re-enter them.');
      return;
    }
    setError(null);
    setOtpStage(true);
  };

  const otpSuccessHref = '/pending';

  const inputStyle = {
    borderColor: '#0000',
    borderRadius: 14,
    border: '1px solid',
    backgroundColor: '#fff',
    padding: '0.7rem 0.85rem',
    fontSize: 14,
    color: COLORS.text,
    width: '100%',
    outline: 'none',
  };

  const field = (label: string, id: string, props: Record<string, unknown>) => (
    <div className="mb-1">
      <label htmlFor={id} className="text-sm mb-1 block font-medium" style={{ color: COLORS.textMuted }}>
        {label}
      </label>
      <input id={id} {...props} style={inputStyle} />
    </div>
  );

  return (
    <AuthLayout heading="Apply as a collector" subheading="Your application is reviewed within 24–72 hours.">
      <form onSubmit={handleSubmit} noValidate>
        {/* Personal */}
        <fieldset className="mb-4">
          <legend className="text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 mb-2" style={{ color: COLORS.textMuted }}>
            <User size={13} style={{ color: COLORS.moss }} /> Personal
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {field('First name', 'firstName', {
              value: firstName,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setFirstName(e.target.value); setError(null); },
              placeholder: 'Zanele', required: true, autoComplete: 'given-name',
            })}
            {field('Last name', 'lastName', {
              value: lastName,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setLastName(e.target.value); setError(null); },
              placeholder: 'Mokoena', required: true, autoComplete: 'family-name',
            })}
          </div>
          {field('Email address', 'email', {
            type: 'email', value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setError(null); },
            placeholder: 'you@example.co.za', required: true, autoComplete: 'email',
          })}
          {field('Cellphone number', 'cellphone', {
            type: 'tel', inputMode: 'tel', value: cellphone,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setCellphone(e.target.value); setError(null); },
            placeholder: '072 123 4567', required: true, autoComplete: 'tel',
          })}
        </fieldset>

        {/* Password */}
        <fieldset className="mb-4">
          <div className="relative">
            {field('Password', 'password', {
              type: showPassword ? 'text' : 'password', value: password,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); setError(null); },
              placeholder: 'Create a password', required: true, autoComplete: 'new-password',
            })}
            <button
              type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-8 opacity-40 hover:opacity-70"
              style={{ color: COLORS.textMuted }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {field('Confirm password', 'confirmPassword', {
            type: showPassword ? 'text' : 'password', value: confirmPassword,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(e.target.value); setError(null); },
            placeholder: 'Re-enter your password', required: true, autoComplete: 'new-password',
          })}
        </fieldset>

        {/* Business & legal */}
        <fieldset className="mb-4">
          <legend className="text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 mb-2" style={{ color: COLORS.textMuted }}>
            <Truck size={13} style={{ color: COLORS.moss }} /> Business &amp; legal
          </legend>
          {field('Company / trading name', 'companyName', {
            value: companyName,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setCompanyName(e.target.value); setError(null); },
            placeholder: 'Mokoena Collectors CC', required: true, autoComplete: 'organization',
          })}
          {field('CIPC enterprise number', 'enterpriseNumber', {
            value: enterpriseNumber,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setEnterpriseNumber(e.target.value); setError(null); },
            placeholder: '2024/012345/07', required: true, inputMode: 'numeric',
          })}
          <div className="mb-1">
            <label className="text-sm mb-1 block font-medium" style={{ color: COLORS.textMuted }}>
              Vehicle type
            </label>
            <select
              value={vehicleType}
              onChange={(e) => { setVehicleType(e.target.value); setError(null); }}
              style={inputStyle}
            >
              {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </fieldset>

        {error && (
          <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-2 text-sm" style={{ backgroundColor: `${COLORS.danger}12`, color: COLORS.danger }}>
            <Info size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" full>
          <Upload size={15} /> Submit application
        </Button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: COLORS.textMuted }}>
        Already applied?{' '}
        <Link to="/signin" style={{ color: COLORS.moss, fontWeight: 600 }}>Sign in</Link>
      </p>

      <OtpModal
        open={otpStage}
        cellphone={formatCellphone(cellphone)}
        otpHint="123456"
        successHref={otpSuccessHref}
        verifyOtp={() => true}
        onClose={() => setOtpStage(false)}
      />
    </AuthLayout>
  );
}
