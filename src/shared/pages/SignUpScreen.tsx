import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout';
import TextField from '../components/TextField';
import Button from '../components/Button';
import OtpModal from '../components/OtpModal';
import { normalizeCellphone } from './LoginScreen';
import { COLORS } from '../theme/tokens';
import { OTP_MOCK_CODE } from '../data/mockUsers';

export interface SignUpScreenProps {
  /** Where the user lands after sign-up OTP (household /tabs/home, collector /tabs/queue). */
  successHref?: string;
}

/**
 * Shared household + collector registration. Captures the household address
 * (house no., street, suburb, municipality, postal code, access notes) plus
 * identity + credentials, then requires a mock OTP via OtpModal before the
 * R150 activation flow (/activate) — both app registrations share exactly
 * this flow.
 */
export default function SignUpScreen({ }: SignUpScreenProps = {}) {
  const history = useHistory();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [suburbTownship, setSuburbTownship] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [complexBuildingName, setComplexBuildingName] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState< 'form' | 'otp' >('form');

  /** OTP submit → mock match routes to the R150 activation screen. */
  const verifyOtp = (code: string): boolean => {
    const ok = code === OTP_MOCK_CODE;
    if (ok) {
      window.setTimeout(() => history.replace('/activate'), 350);
    }
    return ok;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStage('otp');
  };

  return (
    <AuthLayout heading="Create your account" subheading="Join EcoCycle to manage your household recycling and collection.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
          <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
        </div>

        <TextField label="Cellphone" type="tel" value={cellphone} onChange={(e) => setCellphone(e.target.value)} placeholder="07X XXX XXXX" autoComplete="tel" required />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <TextField label="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" />

        <fieldset>
          <legend className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Household address</legend>
          <div className="mt-2 space-y-4">
            <TextField label="House number" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} required />
            <TextField label="Street name" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
            <TextField label="Suburb / township" value={suburbTownship} onChange={(e) => setSuburbTownship(e.target.value)} />
            <TextField label="Municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
            <TextField label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" />
            <TextField label="Complex / building name (optional)" value={complexBuildingName} onChange={(e) => setComplexBuildingName(e.target.value)} />
            <TextField label="Access notes (gate code, security, etc.)" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} />
          </div>
        </fieldset>

        <TextField label="Create password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />

        {error && <p className="text-sm" style={{ color: COLORS.danger }}>{error}</p>}

        <Button variant="primary" full type="submit">Create account</Button>

        <p className="text-center text-sm" style={{ color: COLORS.textMuted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: COLORS.moss }}>Sign in</Link>
        </p>
      </form>

      <OtpModal
        open={stage === 'otp'}
        cellphone={normalizeCellphone(cellphone)}
        otpHint="mock OTP hint (see console)"
        successHref="/activate"
        verifyOtp={verifyOtp}
        onClose={() => setStage('form')}
      />
    </AuthLayout>
  );
}
