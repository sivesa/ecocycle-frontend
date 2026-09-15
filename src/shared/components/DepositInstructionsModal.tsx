// Directory: src/shared/components
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Landmark, X, Copy, Check, MailCheck, Timer } from 'lucide-react';
import { COLORS, DISPLAY_FONT } from '../theme/tokens';
import type { ActivationPaymentInstructions } from '../types/activation';

export interface DepositInstructionsModalProps {
  open: boolean;
  instructions: ActivationPaymentInstructions | null;
  onClose: () => void;
}

function formatZar(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "Something went wrong" guard so an empty/null sheet never renders blank columns. */
function fallback(instructions: ActivationPaymentInstructions | null): ActivationPaymentInstructions {
  if (instructions) return instructions;
  return {
    paymentReference: '---',
    amount: 150,
    accountHolderName: 'EcoCycle Recycling (Pty) Ltd',
    accountNumber: '---',
    branchCode: '---',
    bankName: 'Nedbank',
    expiresAt: '',
    instructions: '',
  };
}

export default function DepositInstructionsModal({
  open,
  instructions,
  onClose,
}: DepositInstructionsModalProps) {
  const data = useMemo(() => fallback(instructions), [instructions]);
  const [copied, setCopied] = useState(false);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(data.paymentReference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (old WebView) — select the text instead.
      window.getSelection()?.selectAllChildren(document.getElementById('deposit-reference')!);
    }
  };

  const expiryLabel = useMemo(() => {
    if (!data.expiresAt) return null;
    const expiry = new Date(data.expiresAt);
    if (Number.isNaN(expiry.getTime())) return null;
    return expiry.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }, [data.expiresAt]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Bank deposit instructions"
    >
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-[6px] animate-[otpFadeIn_0.3s_ease]"
        style={{ backgroundColor: 'rgba(31, 42, 34, 0.45)' }}
      />

      {/* Sheet */}
      <div
        className="relative z-10 w-full max-w-md rounded-t-[2.25rem] px-6 pt-3 pb-8 shadow-2xl animate-[otpSheetUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
        style={{ backgroundColor: '#FBFAF6', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ backgroundColor: COLORS.border }} />

        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <Landmark size={15} color={COLORS.moss} className="shrink-0" />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] truncate"
              style={{ color: COLORS.moss }}
            >
              {data.bankName} cash deposit
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition hover:bg-black/5 active:scale-90"
            style={{ color: COLORS.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-1" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Deposit {formatZar(data.amount)}
        </h2>
        <p className="text-sm mb-5" style={{ color: COLORS.textMuted }}>
          Use this reference so we can match your payment. We&apos;ve also emailed these details to you.
        </p>

        {/* Reference — the headline, with copy affordance */}
        <div className="rounded-2xl border-2 px-4 py-3.5 mb-3" style={{ borderColor: COLORS.border }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: COLORS.textMuted }}>
            Payment reference
          </p>
          <div className="flex items-center justify-between gap-3">
            <p
              id="deposit-reference"
              className="text-lg font-bold break-all select-all leading-tight"
              style={{ color: COLORS.text, ...DISPLAY_FONT }}
            >
              {data.paymentReference}
            </p>
            <button
              type="button"
              onClick={copyReference}
              aria-label="Copy reference"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition active:scale-90"
              style={{ backgroundColor: copied ? `${COLORS.mossLight}22` : `${COLORS.moss}14`, color: copied ? COLORS.mossLight : COLORS.moss }}
            >
              {copied ? <Check size={16} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        {/* Bank account details */}
        <div className="rounded-2xl border px-4 py-3.5 mb-3 space-y-2.5" style={{ borderColor: COLORS.border, backgroundColor: '#FFFFFF' }}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Account holder</p>
            <p className="text-sm font-semibold text-right" style={{ color: COLORS.text }}>{data.accountHolderName}</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Account number</p>
            <p className="text-sm font-semibold text-right tracking-wide" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {data.accountNumber}
            </p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Branch code</p>
            <p className="text-sm font-semibold text-right tracking-wide" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {data.branchCode}
            </p>
          </div>
        </div>

        {/* Instructions + expiry */}
        {data.instructions && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.text }}>
            {data.instructions}
          </p>
        )}

        {expiryLabel && (
          <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: COLORS.kraft }}>
            <Timer size={14} />
            <span>Reference expires today at {expiryLabel}</span>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3 mb-4" style={{ backgroundColor: `${COLORS.moss}0D` }}>
          <MailCheck size={16} className="mt-0.5 shrink-0" style={{ color: COLORS.moss }} />
          <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>
            Pay at any {data.bankName} ATM or branch, or at our office in cash. We&apos;ll confirm once we&apos;ve
            received it and activate your account.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          style={{ backgroundColor: COLORS.moss }}
        >
          I&apos;ve noted the details
        </button>
      </div>
    </div>,
    document.body
  );
}