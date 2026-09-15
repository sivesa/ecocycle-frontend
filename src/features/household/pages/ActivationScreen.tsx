// Directory: src/features/household/pages
import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Mail, CreditCard, Wallet, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import algosdk from 'algosdk';
import AuthLayout from '../../../shared/layout/AuthLayout';
import Button from '../../../shared/components/Button';
import DepositInstructionsModal from '../../../shared/components/DepositInstructionsModal';
import { useAuth } from '../../../shared/context/AuthContext';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import {
  requestDepositInstructions,
  initializePaystackCheckout,
  verifyPaystackCheckout,
  getCryptoQuote,
  verifyCryptoPayment,
  checkActivationStatus,
} from '../../../shared/service/onboardingService';
import { openPaystackInline } from '../../../shared/service/paystackInline';
import {
  algod,
  peraWallet,
  connectPeraWallet,
  disconnectPeraWallet,
} from '../../../shared/service/algorandService';
import type {
  ActivationPaymentInstructions,
  ActivationPaymentStatus,
  CryptoQuoteResponse,
  PaystackInitializeResponse,
} from '../../../shared/types/activation';

export interface ActivationScreenProps {
  /** Where the household lands once Paystack/Pera confirm the payment.
   * Defaults to /login: the backend emails/SMSes the credentials, so the
   * user must sign in with those rather than continuing on the onboarding
   * session. */
  successHref?: string;
}

type Method = 'emailDeposit' | 'paystack' | 'peraWallet';

interface PeraQuoteState {
  quote: CryptoQuoteResponse;
  connectionPhase: 'idle' | 'connecting' | 'awaiting-signature' | 'submitting' | 'verified';
  error?: string;
}

const ACCEPTED_STATUSES: ActivationPaymentStatus[] = ['VERIFIED'];

export default function ActivationScreen({
  successHref = '/login',
}: ActivationScreenProps = {}) {
  const history = useHistory();
  const { logout } = useAuth();
  const [method, setMethod] = useState<Method>('emailDeposit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [depositInstructions, setDepositInstructions] = useState<ActivationPaymentInstructions | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [paystack, setPaystack] = useState<PaystackInitializeResponse | null>(null);
  const [pera, setPera] = useState<PeraQuoteState | null>(null);
  const [accountActivated, setAccountActivated] = useState(false);

  // Keep references in refs so the Canvas-captured event listeners can read
  // the freshest state without re-registering.
  const paystackRef = useRef(paystack);
  paystackRef.current = paystack;
  const historyRef = useRef(history);
  historyRef.current = history;
  // Guard against double-verifying the same Paystack transaction (e.g. the
  // inline `callback` succeeds AND `onClose` then fires).
  const paystackVerifiedRef = useRef(false);

  const redirectOnVerified = useCallback(() => {
    setAccountActivated(true);
    localStorage.removeItem('onboarding_userId');
    localStorage.removeItem('onboarding_phone');
    // The backend emails/SMSes the household's real login credentials once the
    // R150 clears, so drop the temporary onboarding session. Otherwise the
    // /login route's isAuthenticated guard immediately bounces back to
    // /tabs/home and the user never sees the sign-in form.
    logout();
    // Small beat so the success state renders before navigating away.
    window.setTimeout(() => history.replace(successHref), 900);
  }, [successHref, logout, history]);

  // Actively ask the backend to verify a Paystack transaction against the
  // processor. Guarded so each payment is poked at most once — the status
  // poll handles the rest once the DB row flips to VERIFIED.
  const confirmWithPaystack = useCallback(
    async (reference: string) => {
      if (paystackVerifiedRef.current) return;
      paystackVerifiedRef.current = true;
      try {
        const { status } = await verifyPaystackCheckout(reference);
        if (ACCEPTED_STATUSES.includes(status as ActivationPaymentStatus)) {
          redirectOnVerified();
        } else {
          setError('Payment still pending. We will activate the account as soon as Paystack confirms it.');
        }
      } catch {
        setError('Could not confirm your payment right now. We will retry shortly.');
      }
    },
    [redirectOnVerified]
  );

  // Poll activation status every 8 seconds to redirect the user once payment is
  // verified. If a Paystack checkout was initiated but never confirmed by the
  // inline callback (payment completed, webhook unreachable in dev, etc.), poke
  // the backend's verify endpoint once so the DB row can flip to VERIFIED.
  useEffect(() => {
    const poll = async () => {
      try {
        const { status } = await checkActivationStatus();
        if (ACCEPTED_STATUSES.includes(status as ActivationPaymentStatus)) {
          redirectOnVerified();
          return;
        }
        // Safety net: if a Paystack checkout exists but was never verified,
        // nudge the backend to check it against Paystack directly.
        const ref = paystackRef.current?.reference;
        if (ref && !paystackVerifiedRef.current) {
          await confirmWithPaystack(ref);
        }
      } catch (err) {
        console.error('Failed to poll activation status:', err);
      }
    };
    poll();
    const pollInterval = window.setInterval(poll, 8_000);
    return () => window.clearInterval(pollInterval);
  }, [redirectOnVerified, confirmWithPaystack]);

  const switchMethod = (next: Method) => {
    setMethod(next);
    setDepositInstructions(null);
    setDepositModalOpen(false);
    setPaystack(null);
    setPera(null);
    setError('');
    setBusy(false);
  };

  const handleDepositInstructions = async () => {
    setBusy(true);
    setError('');
    try {
      if (!depositInstructions) {
        const instructions = await requestDepositInstructions();
        setDepositInstructions(instructions);
      }
      setDepositModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load deposit instructions.');
    } finally {
      setBusy(false);
    }
  };

  const handlePaystack = async () => {
    setBusy(true);
    setError('');
    try {
      // Paystack Inline `accessCode`s are single-use: a code consumed by a
      // prior checkout (paid, closed, or expired) will 400 on re-open. So
      // always mint a fresh one on each explicit open — never reuse a code
      // that a previous checkout already handed to the SDK.
      const current = await initializePaystackCheckout({});
      setPaystack(current);
      // Each explicit open mints a brand-new reference — the double-verify
      // guard below is per-transaction, not per-component-lifetime, so a
      // retried payment (e.g. the first attempt came back pending) isn't
      // silently skipped by a stale ref from an earlier attempt.
      paystackVerifiedRef.current = false;

      if (!current.accessCode) {
        throw new Error('Paystack did not return a checkout code. Please try again.');
      }

      // Paystack Inline renders the hosted-checkout overlay inside the app's
      // own WebView — no Browser.open handoff and no window.open tab. The
      // user never leaves the app; onSuccess fires the moment Paystack
      // confirms the transaction, and onClose fires if they dismiss the
      // overlay first (the 8s activation-status poll, plus its own
      // verify-on-poll safety net, still catches a payment that actually
      // went through after an early close).
      await openPaystackInline({
        accessCode: current.accessCode,
        onSuccess: (reference) => {
          confirmWithPaystack(reference).finally(() => setBusy(false));
        },
        onClose: () => {
          setBusy(false);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not open Paystack.';
      setPaystack((prev) => (prev ? { ...prev, error: message } : prev));
      setError(message);
      setBusy(false);
    }
  };

  const handlePeraWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      //    tagged with the payment reference, then sign + submit it.
      // The quote is pinned at the start of the Pera flow (backend-minted with a
      // single-use reference), and the Pera Wallet address is captured at connect
      // time as accounts[0] — that address is the sender of the ALGO txn AND the
      // address we hand the backend for independent verification.
      const quote = await getCryptoQuote();
      const [walletAddress] = await connectPeraWallet();
      const suggestedParams = await algod.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: walletAddress,
        receiver: quote.receiveAddress,
        amount: quote.amountMicroAlgos,
        note: new TextEncoder().encode(`EcoCycle activation:${quote.reference}`),
        suggestedParams,
      });

      setPera({ quote, connectionPhase: 'submitting' });
      const signedTxns = await peraWallet.signTransaction([[{ txn, signers: [walletAddress] }]]);
      const { txid } = await algod.sendRawTransaction(signedTxns).do();
      await algosdk.waitForConfirmation(algod, txid, 8);

      // 4. Hand the signed transaction to the backend for independent verification.
      const result = await verifyCryptoPayment({
        reference: quote.reference,
        txId: txid,
        walletAddress,
        amountMicroAlgos: quote.amountMicroAlgos,
      });

      if (result) {
        setPera({ quote, connectionPhase: 'verified' });
        await disconnectPeraWallet();
        redirectOnVerified();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not complete the crypto payment.';
      setPera((prev) => (prev ? { ...prev, error: message } : prev));
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const verificationLabel =
    method === 'emailDeposit'
      ? depositInstructions
        ? 'Upload or deposit the amount using the reference above — we\'re watching for it.'
        : 'Use the reference we generate so your payment matches instantly.'
      : method === 'paystack'
        ? 'Pay securely in the hosted checkout. We\'ll verify the second you\'re back.'
        : 'A live quote pins today\'s Algorand rate — final for 3 minutes.';

  return (
    <AuthLayout heading="Activate your account" subheading="One-time R150 unlocks your first pick-up">
      {accountActivated && (
        <div className="rounded-2xl border px-4 py-3.5 mb-4 flex items-center gap-3 animate-[otpFadeIn_0.3s_ease]"
          style={{ borderColor: COLORS.mossLight, backgroundColor: `${COLORS.mossLight}14` }}>
          <CheckCircle2 size={20} style={{ color: COLORS.mossLight }} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: COLORS.text }}>Payment confirmed</p>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Activating your account…</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm mb-4" style={{ color: COLORS.danger }}>
          {error}
        </p>
      )}

      <form onSubmit={handlePeraWallet}>
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-bold" style={{ ...DISPLAY_FONT, color: COLORS.text }}>
            R150.00
          </p>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: COLORS.kraft }}>
            once-off
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: COLORS.textMuted }}>
          Pay once, recycle forever. Your fee funds your first pickup.
        </p>

        {/* Bank deposit */}
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
              Bank deposit
            </span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Nedbank ATM / branch, or cash at our office.
            </span>
          </span>
          {method === 'emailDeposit' && depositInstructions && (
            <span className="text-[11px] font-bold uppercase shrink-0" style={{ color: COLORS.moss }}>Ready</span>
          )}
        </button>

        {method === 'emailDeposit' && (
          <Button
            type="button"
            variant="primary"
            full
            className="mt-3"
            disabled={busy}
            onClick={handleDepositInstructions}
          >
            {busy && !depositInstructions ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating instructions…
              </>
            ) : depositInstructions ? (
              'Show my deposit details'
            ) : (
              'Get deposit instructions'
            )}
          </Button>
        )}

        {/* Paystack */}
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
            <span className="block text-sm font-semibold" style={{ color: COLORS.text }}>Paystack</span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Pay instantly by card — secured checkout stays in the app.
            </span>
          </span>
        </button>

        {method === 'paystack' && (
          <Button
            type="button"
            variant="primary"
            full
            className="mt-3"
            disabled={busy}
            onClick={handlePaystack}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Opening payment…
              </>
            ) : (
              <>
                Pay R150 with card <ArrowUpRight size={16} />
              </>
            )}
          </Button>
        )}

        {/* Pera wallet */}
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
            <span className="block text-sm font-semibold" style={{ color: COLORS.text }}>Pera Wallet</span>
            <span className="block text-xs" style={{ color: COLORS.textMuted }}>
              Pay straight from your Algorand wallet.
            </span>
          </span>
          {method === 'peraWallet' && pera?.quote && (
            <span className="text-[11px] font-bold shrink-0" style={{ color: COLORS.moss, ...DISPLAY_FONT }}>
              {(pera.quote.amountMicroAlgos / 1_000_000).toFixed(2)} ALGO
            </span>
          )}
        </button>

        {method === 'peraWallet' && pera?.quote && (
          <div className="rounded-2xl border px-4 py-3.5 mt-3 space-y-2" style={{ borderColor: COLORS.border, backgroundColor: '#fff' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: COLORS.textMuted }}>Algorand quote</p>
              <p className="text-sm font-semibold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
                {(pera.quote.amountMicroAlgos / 1_000_000).toFixed(4)} ALGO
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: COLORS.textMuted }}>Rate</p>
              <p className="text-sm font-semibold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
                ZAR {pera.quote.zarPerAlgo.toFixed(2)} / ALGO
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: COLORS.textMuted }}>Quote expires</p>
              <p className="text-sm font-semibold" style={{ color: COLORS.kraft, ...DISPLAY_FONT }}>
                {new Date(pera.quote.expiresAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} today
              </p>
            </div>
          </div>
        )}

        {method === 'peraWallet' && !pera?.quote && (
          <div className="mt-3 rounded-2xl border border-dashed px-4 py-3.5 flex items-center gap-3"
            style={{ borderColor: COLORS.border }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${COLORS.moss}14` }}>
              <Wallet size={15} style={{ color: COLORS.moss }} />
            </span>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>
              We&apos;ll fetch a live ALGO rate, then connect your wallet to sign one payment.
            </p>
          </div>
        )}

        {/* Pera submit button participates in the form submit (signing flow);
            other methods use their own buttons above. */}
        {method === 'peraWallet' && (
          <Button type="submit" variant="primary" full className="mt-3" disabled={busy || pera?.connectionPhase === 'verified'}>
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {pera?.connectionPhase === 'connecting' || pera?.connectionPhase === 'awaiting-signature'
                  ? 'Waiting for your signature…'
                  : pera?.connectionPhase === 'submitting'
                    ? 'Submitting to the network…'
                    : 'Processing…'}
              </>
            ) : pera?.connectionPhase === 'verified' ? (
              'Payment confirmed'
            ) : pera?.quote ? (
              'Pay R150 with Pera Wallet'
            ) : (
              'Get rate & connect wallet'
            )}
          </Button>
        )}

        <p className="text-xs text-center mt-5 leading-relaxed" style={{ color: COLORS.textMuted }}>
          {verificationLabel}
        </p>
      </form>

      <DepositInstructionsModal
        open={depositModalOpen}
        instructions={depositInstructions}
        onClose={() => setDepositModalOpen(false)}
      />
    </AuthLayout>
  );
}