import { useState } from 'react';
import type { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { Mail, CreditCard, Wallet } from 'lucide-react';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';

export interface ActivationScreenProps {
  /** Where the account lands after the R150 is paid (household /tabs/home, collector /tabs/queue). */
  successHref?: string;
}

type Method = 'emailDeposit' | 'paystack' | 'peraWallet';

/**
 * Shared R150 activation, reached after OTP succeeds during registration for
 * BOTH the household and collector apps (same /activate route in each
 * registration). Covers the one-time activation deposit before the first
 * pick-up; the success navigation is app-specific via `successHref`.
 */
export default function ActivationScreen({
  successHref = '/tabs/home',
}: ActivationScreenProps = {}) {
  const history = useHistory();
  const [method, setMethod] = useState<Method>('emailDeposit');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError('');
    // Simulate the R150 payment round-trip, then hand the user into the app.
    window.setTimeout(() => {
      setSending(false);
      history.replace(successHref);
    }, 800);
  };

  return (
    <AuthLayout heading="Activate your account" subheading="One-time R150 unlocks your first pick-up">
      {error && (
        <p className="text-sm mb-4" style={{ color: COLORS.danger }}>
          {error}
        </p>
      )}

      <form onSubmit={handleActivate}>
        <p className="text-2xl font-bold mb-1" style={{ ...DISPLAY_FONT, color: COLORS.text }}>
          R150.00
        </p>
        <p className="text-sm mb-5" style={{ color: COLORS.textMuted }}>
          A single payment to activate your recycling account.
        </p>

        <button
          type="button"
          onClick={() => setMethod('emailDeposit')}
          className="w-full text-left rounded-2xl border-2 p-3.5 flex items-center gap-3 transition-colors"
          style={{
            borderColor: method === 'emailDeposit' ? COLORS.moss : COLORS.border,
            backgroundColor: method === 'emailDeposit' ? `${COLORS.moss}0F` : '#fff',
          }}
          aria-pressed={method === 'emailDeposit'}
        >
          <Mail size={20} style={{ color: method === 'emailDeposit' ? COLORS.moss : COLORS.textMuted }} />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold" style={{ color: COLORS.text }}>
              Send email with Deposit Instructions
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              We&apos;ll email the banking details for a secure EFT.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('paystack')}
          className="w-full text-left rounded-2xl border-2 p-3.5 flex items-center gap-3 mt-3 transition-colors"
          style={{
            borderColor: method === 'paystack' ? COLORS.moss : COLORS.border,
            backgroundColor: method === 'paystack' ? `${COLORS.moss}0F` : '#fff',
          }}
          aria-pressed={method === 'paystack'}
        >
          <CreditCard size={20} style={{ color: method === 'paystack' ? COLORS.moss : COLORS.textMuted }} />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold" style={{ color: COLORS.text }}>
              Paystack
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Pay instantly by card — secure hosted checkout.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('peraWallet')}
          className="w-full text-left rounded-2xl border-2 p-3.5 flex items-center gap-3 mt-3 transition-colors"
          style={{
            borderColor: method === 'peraWallet' ? COLORS.moss : COLORS.border,
            backgroundColor: method === 'peraWallet' ? `${COLORS.moss}0F` : '#fff',
          }}
          aria-pressed={method === 'peraWallet'}
        >
          <Wallet size={20} style={{ color: method === 'peraWallet' ? COLORS.moss : COLORS.textMuted }} />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold" style={{ color: COLORS.text }}>
              Pera Wallet
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Pay straight from your wallet balance.
            </span>
          </span>
        </button>

        <Button type="submit" variant="primary" full className="mt-5" disabled={sending}>
          {sending ? 'Activating…' : 'Pay R150 and activate'}
        </Button>
      </form>

      <p className="text-sm text-center mt-5" style={{ color: COLORS.textMuted }}>
        Your deposit funds the first pick-up. See you in the app soon.
      </p>
    </AuthLayout>
  );
}
