// Directory: src/shared/components
import { useEffect, useRef, useState, useCallback } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X, Lock } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { COLORS, DISPLAY_FONT } from '../theme/tokens';

export interface OtpModalProps {
  open: boolean;
  /** Cellphone number awaiting verification, shown masked in the sheet. */
  cellphone: string;
  verifyOtp: (code: string) => Promise<boolean>;
  onClose: () => void;
  /** Where the user lands after a successful verification. App-specific:
   * household login goes to /tabs/home, collector login goes to /tabs/queue. */
  successHref?: string;
  /** Demo-only: literal OTP code displayed as a hint beneath the inputs. */
  otpHint?: string;
}

const OTP_LENGTH = 6;
const SUCCESS_MS = 650;

export function formatCellphone(cellphone: string): string {
  const digits = cellphone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+27 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return cellphone;
}

function maskCellphone(cellphone: string): string {
  const digits = cellphone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+27 ${digits.slice(1, 3)} ${digits.slice(3, 5)}•• ${digits.slice(7)}`;
  }
  return cellphone;
}

export default function OtpModal({ open, cellphone, verifyOtp, onClose, successHref = '/tabs/home' }: OtpModalProps) {
  const history = useHistory();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  const reset = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setVerifying(false);
    setSuccess(false);
    setCountdown(30);
  }, []);

  // Lock background scroll + focus the first box while the sheet is open.
  useEffect(() => {
    if (!open) return;
    reset();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputsRef.current[0]?.focus(), 350);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(t);
    };
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [open]);

  const submitCode = useCallback(async () => {
    if (code.length !== OTP_LENGTH || verifying || success) return;
    setVerifying(true);
    setError(null);

    try {
      const ok = await verifyOtp(code);
      if (ok) {
        setSuccess(true);
        window.setTimeout(() => history.replace(successHref), SUCCESS_MS);
      } else {
        setVerifying(false);
        setError('That code did not match. Please try again.');
        setShakeKey((k) => k + 1);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setVerifying(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setShakeKey((k) => k + 1);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    }
  }, [code, verifying, success, verifyOtp, history, successHref]);

  // Auto-submit when the 6th digit lands.
  useEffect(() => {
    if (code.length === OTP_LENGTH) {
      const t = window.setTimeout(submitCode, 250);
      return () => window.clearTimeout(t);
    }
  }, [code, submitCode]);

  const handleDigitChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    setError(null);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    setError(null);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="One-time password verification"
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

        {success ? (
          <div className="flex flex-col items-center py-8 animate-[otpFadeIn_0.3s_ease]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-[otpPop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ backgroundColor: `${COLORS.moss}1A` }}
            >
              <ShieldCheck size={30} color={COLORS.moss} />
            </div>
            <h2 className="text-xl font-semibold text-center" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              Number verified
            </h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
              Taking you to your household…
            </p>
          </div>
        ) : (
          <>
            {/* Header row: label + close button share one in-flow flex line so
                nothing ever overlaps the X. */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <Lock size={15} color={COLORS.moss} className="shrink-0" />
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] truncate"
                  style={{ color: COLORS.moss }}
                >
                  Secure verification
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
              Enter the code
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.textMuted }}>
              We sent a 6-digit code to{' '}
              <span className="font-semibold" style={{ color: COLORS.text }}>
                {maskCellphone(cellphone)}
              </span>
            </p>

            {/* Digit boxes — fluid 6-column grid so they always fit the sheet,
                regardless of screen width. */}
            <div
              key={shakeKey}
              className={`grid grid-cols-6 gap-1.5 sm:gap-2 mx-auto w-full max-w-[24rem] mb-2 ${shakeKey ? 'animate-[otpShake_0.4s_ease]' : ''}`}
            >
              {digits.map((d, i) => {
                const isFocused = d === '' && i === code.length && !verifying;
                return (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={d}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={2}
                    aria-label={`Digit ${i + 1}`}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={verifying}
                    className="w-full aspect-square min-w-0 rounded-2xl text-center text-2xl font-semibold outline-none transition-all duration-150 disabled:opacity-60"
                    style={{
                      ...DISPLAY_FONT,
                      color: COLORS.text,
                      backgroundColor: isFocused ? '#FFFFFF' : `${COLORS.moss}0C`,
                      border: isFocused
                        ? `2px solid ${COLORS.moss}`
                        : `1.5px solid ${d ? COLORS.mossLight : COLORS.border}`,
                      boxShadow: isFocused ? `0 4px 18px -6px ${COLORS.moss}55` : 'none',
                      transform: isFocused ? 'translateY(-2px)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {error ? (
              <p className="text-sm mb-2" style={{ color: COLORS.danger }}>
                {error}
              </p>
            ) : (
              <p className="text-xs mb-2 h-5" style={{ color: COLORS.textMuted }}>
                {verifying ? 'Verifying code…' : ' '}
              </p>
            )}

            <button
              type="button"
              onClick={submitCode}
              disabled={code.length !== OTP_LENGTH || verifying}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: COLORS.moss }}
            >
              {verifying ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify & continue'
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-5 text-sm">
              <span style={{ color: COLORS.textMuted }}>Didn&apos;t get it?</span>
              <button
                type="button"
                onClick={() => {
                  setCountdown(30);
                  setError(null);
                }}
                disabled={countdown > 0}
                className="font-semibold disabled:opacity-50"
                style={{ color: COLORS.moss }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}