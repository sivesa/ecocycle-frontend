// Directory: src/features/household/pages
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthLayout from '../../../shared/layout/AuthLayout';
import TextField from '../../../shared/components/TextField';
import Button from '../../../shared/components/Button';
import OtpModal from '../../../shared/components/OtpModal';
import { normalizeCellphone } from './LoginScreen';
import { COLORS } from '../../../shared/theme/tokens';
import { registerHousehold } from '../service/onboardingService';
import { verifyOtp } from '../../../shared/services/onboardingService';
import { storeAuthTokens } from '../../../shared/services/authStorage';
import type { HouseholdOnboardingRequest } from '../types/householdOnboarding';

export interface SignUpScreenProps {
  /** Where the user lands after sign-up OTP (currently always /activate). */
  successHref?: string;
}

const PHONE_PATTERN = /^(\+27|0)[1-9][0-9]{8}$/;
const ID_NUMBER_PATTERN = /^[0-9]{13}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen(_props: SignUpScreenProps = {}) {
  const history = useHistory();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [citySuburbTownship, setCitySuburbTownship] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [complexBuildingName, setComplexBuildingName] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'form' | 'otp'>('form');

  /**
   * verifyOtp() throws (via httpClient's ApiError) on any non-2xx response —
   * see OtpModal's submitCode, which already wraps this call in a try/catch
   * and treats a thrown error as "show err.message". So reaching the return
   * below at all means the backend accepted the code; there's no separate
   * `verified`/`success` flag on the response to check (AuthResponseDto
   * just carries the tokens directly on success).
   */
  const handleVerifyOtp = async (code: string): Promise<boolean> => {
    const storedPhone = localStorage.getItem('onboarding_phone');
    if (!storedPhone) {
      throw new Error('Session expired. Please register again.');
    }

    const result = await verifyOtp({ phone: storedPhone, otpCode: code });

    // Persist the issued session tokens if the response carries them.
    if (result && typeof result === 'object' && 'accessToken' in result) {
      const { accessToken, refreshToken } = result as { accessToken?: string; refreshToken?: string };
      storeAuthTokens(accessToken, refreshToken);
    }

    localStorage.removeItem('onboarding_userId');
    localStorage.removeItem('onboarding_phone');

    return true;
  };

  function validate(): string | null {
    if (!PHONE_PATTERN.test(phone)) {
      return 'Enter a valid South African phone number (e.g. 0831234567 or +27831234567).';
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return 'Enter a valid email address, or leave it blank.';
    }
    if (!ID_NUMBER_PATTERN.test(idNumber)) {
      return 'ID number must be exactly 13 digits.';
    }
    if (!houseNumber || Number(houseNumber) < 1) {
      return 'Enter a valid house/stand/unit number.';
    }
    if (!acceptedTerms) {
      return 'You must accept the Terms & Conditions and Privacy Policy.';
    }
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitting(true);

    const payload: HouseholdOnboardingRequest = {
      phone,
      email: email || undefined,
      firstName,
      lastName,
      idNumber,
      houseNumber: Number(houseNumber),
      streetName,
      citySuburbTownship,
      municipality,
      postalCode,
      complexBuildingName: complexBuildingName || undefined,
      accessNotes: accessNotes || undefined,
    };

    try {
      const response = await registerHousehold(payload);

      if (response.requiresOtpVerification) {
        localStorage.setItem('onboarding_userId', response.userId.toString());
        localStorage.setItem('onboarding_phone', response.phone);
        setStage('otp');
      } else {
        // If OTP not required, go straight to activation
        history.replace('/activate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout heading="Create your account" subheading="Join EcoCycle to manage your household recycling and collection.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
          <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
        </div>

        <TextField label="Cellphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" autoComplete="tel" required />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"required />
        <TextField label="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" maxLength={13} required />

        <fieldset>
          <legend className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Household address</legend>
          <div className="mt-2 space-y-4">
            <TextField label="House / stand / unit number" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} inputMode="numeric" required />
            <TextField label="Street name" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
            <TextField label="Suburb / township" value={citySuburbTownship} onChange={(e) => setCitySuburbTownship(e.target.value)} required />
            <TextField label="Municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)} required />
            <TextField label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" required />
            <TextField label="Complex / building name (optional)" value={complexBuildingName} onChange={(e) => setComplexBuildingName(e.target.value)} />
            <TextField label="Access notes (gate code, security, etc.)" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} />
          </div>
        </fieldset>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-gray-300 text-moss focus:ring-moss"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <span className="text-sm" style={{ color: COLORS.textMuted }}>
            I accept the <Link to="/terms" className="underline" style={{ color: COLORS.moss }}>Terms & Conditions</Link> and <Link to="/privacy" className="underline" style={{ color: COLORS.moss }}>Privacy Policy</Link>.
          </span>
        </label>

        {error && <p className="text-sm" style={{ color: COLORS.danger }}>{error}</p>}

        <Button variant="primary" full type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm" style={{ color: COLORS.textMuted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: COLORS.moss }}>Sign in</Link>
        </p>
      </form>

      <OtpModal
        open={stage === 'otp'}
        cellphone={normalizeCellphone(phone)}
        successHref="/activate"
        verifyOtp={handleVerifyOtp}
        onClose={() => setStage('form')}
      />
    </AuthLayout>
  );
}