// Directory: src/features/household/pages
import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { Mail, CreditCard, Wallet } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { PeraWalletConnect } from '@perawallet/connect';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import {
  requestDepositInstructions,
  initializePaystackCheckout,
  getCryptoQuote,
  verifyCryptoPayment,
  checkActivationStatus,
} from '../../../shared/services/onboardingService';
import type { ActivationPaymentInstructions, CryptoQuoteResponse } from '../types/activation';

export interface ActivationScreenProps {
  /** Where the account lands after the R150 is paid. */
  successHref?: string;
}

type Method = 'emailDeposit' | 'paystack' | 'peraWallet';

export default function ActivationScreen({
  successHref = '/tabs/home',
}: ActivationScreenProps = {}) {
  const history = useHistory();
  const [method, setMethod] = useState<Method>('emailDeposit');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [depositInstructions, setDepositInstructions] = useState<ActivationPaymentInstructions | null>(null);
  const [cryptoQuote, setCryptoQuote] = useState<CryptoQuoteResponse | null>(null);

  // Poll activation status every 10 seconds to redirect the user once payment is verified.
  useEffect(() => {
    const pollInterval = window.setInterval(async () => {
      try {
        const { status } = await checkActivationStatus();
        if (status === 'VERIFIED') {
          // Clear session tokens if any, and redirect to login/home.
          localStorage.removeItem('onboarding_userId');
          localStorage.removeItem('onboarding_phone');
          history.replace(successHref);
        }
      } catch (err) {
        console.error('Failed to poll activation status:', err);
      }
    }, 10_000);

    return () => window.clearInterval(pollInterval);
  }, [history, successHref]);

  const switchMethod = (next: Method) => {
    setMethod(next);
    setDepositInstructions(null);
    setCryptoQuote(null);
    setError('');
  };

  const handleActivate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      if (method === 'emailDeposit') {
        if (!depositInstructions) {
          setDepositInstructions(await requestDepositInstructions());
          setSending(false);
          return;
        }
        // For manual deposits, the user has "paid" if they click this after instructions are shown.
        // The polling interval will eventually see the VERIFIED status from the backend.
        setSending(false);
        return;
      }

      if (method === 'paystack') {
        const { authorizationUrl, reference } = await initializePaystackCheckout({});

        // Open Paystack checkout in a Capacitor browser window.
        await Browser.open({ url: authorizationUrl });

        // After the browser closes, we can optionally check status immediately,
        // but our polling interval handles this globally.
        setSending(false);
        return;
      }

      if (method === 'peraWallet') {
        if (!cryptoQuote) {
          setCryptoQuote(await getCryptoQuote());
          setSending(false);
          return;
        }

        // Initialize Pera Wallet connection.
        const peraWallet = new PeraWalletConnect();
        const accounts = await peraWallet.connect();
        const walletAddress = accounts[0];

        if (!walletAddress) {
          throw new Error('Pera Wallet connection failed. Please ensure the app is installed.');
        }

        // Construct the Algorand transaction for the activation fee.
        // Note: In a real app, the backend provides a signed transaction or we use algosdk.
        // Here we assume we verify the transaction ID after the user sends it.

        // We'll simulate the transaction submission process.
        // In production, you'd use peraWallet.sendVoucher or similar.
        const txId = 'simulated-tx-id-from-pera';

        await verifyCryptoPayment({
          reference: cryptoQuote.reference,
          txId,
          walletAddress,
          amountMicroAlgos: cryptoQuote.amountMicroAlgos,
        });

        setSending(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
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
          onClick={() => switchMethod('emailDeposit')}
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
              Bank Deposit (Manual)
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              We&apos;ll provide banking details for a secure EFT.
            </span>
          </span>
        </button>

        {method === 'emailDeposit' && depositInstructions && (
          <div className="rounded-2xl border p-3.5 mt-3 space-y-1" style={{ borderColor: COLORS.border }}>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Reference</p>
            <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{depositInstructions.paymentReference}</p>
            <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>
              {depositInstructions.bankName} · {depositInstructions.accountHolderName}
            </p>
            <p className="text-sm" style={{ color: COLORS.text }}>
              Acc {depositInstructions.accountNumber} · Branch {depositInstructions.branchCode}
            </p>
            <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>{depositInstructions.instructions}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => switchMethod('paystack')}
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
          onClick={() => switchMethod('peraWallet')}
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
              Pera Wallet (Algorand)
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Pay straight from your wallet balance.
            </span>
          </span>
        </button>

        {method === 'peraWallet' && cryptoQuote && (
          <div className="rounded-2xl border p-3.5 mt-3 space-y-1" style={{ borderColor: COLORS.border }}>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Payment Details</p>
            <p className="text-sm font-semibold break-all" style={{ color: COLORS.text }}>
              {(cryptoQuote.amountMicroAlgos / 1_000_000).toFixed(4)} ALGO
            </p>
            <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>
              Quote valid until {new Date(cryptoQuote.expiresAt).toLocaleTimeString()}
            </p>
          </div>
        )}

        <Button type="submit" variant="primary" full className="mt-5" disabled={sending}>
          {sending
            ? 'Processing…'
            : method === 'emailDeposit' && !depositInstructions
              ? 'Get deposit instructions'
              : method === 'peraWallet' && !cryptoQuote
                ? 'Get quote'
                : 'Pay R150 and activate'}
        </Button>
      </form>

      <p className="text-sm text-center mt-5" style={{ color: COLORS.textMuted }}>
        Your deposit funds the first pick-up. See you in the app soon.
      </p>
    </AuthLayout>
  );
}