// Directory: src/features/household/pages
import { useRef, useState, useEffect, useCallback } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { IonModal, IonToast } from '@ionic/react';
import {
  Plus, ChevronRight, ChevronLeft, Cog, GlassWater, Newspaper, CupSoda,
  CheckCircle2, CircleDot, ShieldCheck, X, Ban, Wallet, Banknote, Bitcoin,
} from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT, WASTE_CATEGORIES } from '../../../shared/theme/tokens';
import type { WasteCategory, WasteCategoryId } from '../../../shared/theme/tokens';
import { MOCK_WASTE_ITEMS, WASTE_VERIFICATION_OTP } from '../data/mockData';
import type { MockWasteItem, WasteItemStatus, PayoutMethod } from '../data/mockData';

const CATEGORY_ICONS: Record<WasteCategoryId, typeof Cog> = {
  metal: Cog,
  glass: GlassWater,
  paper: Newspaper,
  plastic: CupSoda,
};

const STATUS_CONFIG: Record<WasteItemStatus, { label: string; color: string; bg: string; icon: typeof CircleDot }> = {
  pending: { label: 'Pending', color: COLORS.kraft, bg: `${COLORS.kraft}14`, icon: CircleDot },
  verified: { label: 'Verified', color: COLORS.sky, bg: `${COLORS.sky}14`, icon: CheckCircle2 },
  completed: { label: 'Completed', color: COLORS.mossLight, bg: `${COLORS.mossLight}14`, icon: CheckCircle2 },
};

/* ======================  LOG NEW ITEM MODAL  ===================== */

type LogStep = 'category' | 'item';

interface LogWasteSheetProps {
  modalRef: React.RefObject<HTMLIonModalElement>;
  onDismiss: () => void;
  onSubmit: (payload: { category: string; item: string; qty: string }) => void;
}

function LogWasteSheet({ modalRef, onDismiss, onSubmit }: LogWasteSheetProps) {
  const [step, setStep] = useState<LogStep>('category');
  const [category, setCategory] = useState<WasteCategory | null>(null);
  const [item, setItem] = useState<string | null>(null);
  const [qty, setQty] = useState('');

  const reset = () => { setStep('category'); setCategory(null); setItem(null); setQty(''); };
  const close = () => { onDismiss(); reset(); };

  return (
    <IonModal
      ref={modalRef}
      trigger="open-log-waste"
      initialBreakpoint={0.62}
      breakpoints={[0, 0.62, 0.9]}
      onDidDismiss={() => reset()}
    >
      <div className="px-6 pt-5 pb-8">
        {step === 'category' && (
          <>
            <h2 className="text-lg font-semibold mb-1" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              Log new waste
            </h2>
            <p className="text-[13px] mb-5" style={{ color: COLORS.textMuted }}>
              Choose a waste category
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {WASTE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat); setItem(null); setStep('item'); }}
                    className="flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97]"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}18` }}
                    >
                      <Icon size={20} color={cat.color} strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: COLORS.text }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button variant="secondary" full onClick={close}>Cancel</Button>
          </>
        )}

        {step === 'item' && category && (
          <>
            <button onClick={() => setStep('category')} className="flex items-center gap-1.5 text-[13px] font-medium mb-4" style={{ color: COLORS.textMuted }}>
              <ChevronLeft size={16} /> Back to categories
            </button>
            <h2 className="text-lg font-semibold mb-1" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {category.label}
            </h2>
            <p className="text-[13px] mb-5" style={{ color: COLORS.textMuted }}>
              Select the item you&apos;re logging
            </p>
            <div className="space-y-2 mb-5">
              {category.items.map((it) => {
                const isSel = item === it;
                return (
                  <button
                    key={it}
                    onClick={() => setItem(it)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: isSel ? category.color : COLORS.border,
                      backgroundColor: isSel ? `${category.color}0D` : '#fff',
                    }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: COLORS.text }}>{it}</span>
                    {isSel && <ChevronRight size={16} color={category.color} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
            {item && (
              <div className="mb-5">
                <label className="text-[13px] mb-1.5 block font-medium" style={{ color: COLORS.textMuted }}>
                  Estimated weight (kg)
                </label>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="e.g. 2.5"
                  inputMode="decimal"
                  className="w-full border rounded-xl px-4 py-3 text-[13px] outline-none transition-colors focus:border-moss"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={close} className="flex-1">Cancel</Button>
              <Button
                variant="primary"
                disabled={!item || !qty}
                onClick={() => {
                  if (category && item) {
                    onSubmit({ category: category.label, item, qty });
                    close();
                  }
                }}
                className="flex-1"
              >
                Log Waste Item
              </Button>
            </div>
          </>
        )}
      </div>
    </IonModal>
  );
}

/* ======================  WASTE VERIFY MODAL  ===================== */

const VERIFY_OTP_LENGTH = 6;

interface WasteVerifyModalProps {
  open: boolean;
  item: MockWasteItem | null;
  onClose: () => void;
  onComplete: (itemId: string) => void;
  onCancel: (itemId: string) => void;
}

function WasteVerifyModal({ open, item, onClose, onComplete, onCancel }: WasteVerifyModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(VERIFY_OTP_LENGTH).fill(''));
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [cleanliness, setCleanliness] = useState<'dirty' | 'moderate' | 'clean' | null>(null);
  const [actualWeight, setActualWeight] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | null>(null);
  const [completeDisabled, setCompleteDisabled] = useState(true);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const reset = useCallback(() => {
    setOtp(Array(VERIFY_OTP_LENGTH).fill(''));
    setOtpVerified(false);
    setCountdown(900);
    setCleanliness(null);
    setActualWeight('');
    setPayoutMethod(null);
    setCompleteDisabled(true);
  }, []);

  useEffect(() => {
    if (open) {
      reset();
      const t = window.setTimeout(() => otpRefs.current[0]?.focus(), 400);
      return () => window.clearTimeout(t);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open || otpVerified) return;
    const t = window.setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [open, otpVerified]);

  useEffect(() => {
    const ready = otpVerified && cleanliness && actualWeight && payoutMethod;
    setCompleteDisabled(!ready);
  }, [otpVerified, cleanliness, actualWeight, payoutMethod]);

  const verifyOtpCode = useCallback(() => {
    const code = otp.join('');
    if (code.length !== VERIFY_OTP_LENGTH) return;
    if (code === WASTE_VERIFICATION_OTP) {
      setOtpVerified(true);
    } else {
      setOtp(Array(VERIFY_OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    }
  }, [otp]);

  const handleOtpChange = (index: number, raw: string) => {
    const val = raw.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < VERIFY_OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, VERIFY_OTP_LENGTH);
    if (!p) return;
    const next = Array(VERIFY_OTP_LENGTH).fill('');
    p.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(p.length, VERIFY_OTP_LENGTH - 1)]?.focus();
  };

  // Auto-verify when all 6 digits are entered
  const codeStr = otp.join('');
  useEffect(() => {
    if (codeStr.length === VERIFY_OTP_LENGTH) {
      const t = window.setTimeout(verifyOtpCode, 300);
      return () => window.clearTimeout(t);
    }
  }, [codeStr, verifyOtpCode]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div aria-hidden onClick={onClose} className="absolute inset-0 backdrop-blur-[6px]" style={{ backgroundColor: 'rgba(31,42,34,0.4)' }} />
      <div
        className="relative z-10 w-full max-w-md rounded-t-[2.25rem] bg-white shadow-2xl animate-[otpSheetUp_0.45s_cubic-bezier(0.22,1,0.36,1)] overflow-y-auto overscroll-contain"
        style={{ maxHeight: '92vh', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom,0px))' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: COLORS.border }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-1 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} color={COLORS.moss} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: COLORS.moss }}>
                Collector Verification
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              Verify waste collection
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-black/5 shrink-0" style={{ color: COLORS.textMuted }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 space-y-5">
          {/* Item details */}
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: `${item.color}0A`, border: `1px solid ${item.color}22` }}>
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}18` }}>
              <span className="text-lg font-bold" style={{ color: item.color, ...DISPLAY_FONT }}>
                {item.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: COLORS.text }}>{item.name}</p>
              <p className="text-[12px] font-medium" style={{ color: COLORS.textMuted }}>{item.category} &middot; {item.weight}</p>
            </div>
          </div>

          {/* OTP Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: COLORS.text }}>Household OTP</p>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${countdown <= 120 ? 'text-[#C4553D]' : ''}`}
                style={{
                  backgroundColor: countdown <= 120 ? `${COLORS.danger}14` : `${COLORS.moss}14`,
                  color: countdown <= 120 ? COLORS.danger : COLORS.moss,
                }}
              >
                {formatCountdown(countdown)}
              </span>
            </div>
            <p className="text-[12px] mb-3" style={{ color: COLORS.textMuted }}>
              Share this OTP with the collector upon physical arrival.
            </p>
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {otp.map((d, i) => {
                const focus = d === '' && i === otp.join('').length && !otpVerified;
                return (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    value={d}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={2}
                    disabled={otpVerified}
                    aria-label={`OTP digit ${i + 1}`}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="w-full aspect-square min-w-0 rounded-xl text-center text-[18px] font-bold outline-none transition-all duration-150 disabled:opacity-60"
                    style={{
                      ...DISPLAY_FONT,
                      color: COLORS.text,
                      backgroundColor: focus ? '#fff' : `${COLORS.moss}08`,
                      border: otpVerified
                        ? `2px solid ${COLORS.mossLight}`
                        : focus
                          ? `2px solid ${COLORS.moss}`
                          : `1.5px solid ${d ? COLORS.mossLight : COLORS.border}`,
                      boxShadow: focus ? `0 3px 12px -4px ${COLORS.moss}44` : 'none',
                    }}
                  />
                );
              })}
            </div>
            {!otpVerified ? (
              <p className="text-[11px] font-semibold" style={{ color: COLORS.moss }}>
                Mock OTP: {WASTE_VERIFICATION_OTP}
              </p>
            ) : (
              <p className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: COLORS.mossLight }}>
                <CheckCircle2 size={14} strokeWidth={2.5} /> OTP verified — collector confirmed
              </p>
            )}
          </div>

          {/* Physical Inspection */}
          <div>
            <p className="text-[13px] font-semibold mb-3" style={{ color: COLORS.text }}>
              Cleanliness inspection
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['dirty', 'moderate', 'clean'] as const).map((level) => {
                const sel = cleanliness === level;
                const labels = { dirty: 'Dirty', moderate: 'Moderate', clean: 'Clean' };
                const colors = { dirty: COLORS.danger, moderate: COLORS.kraft, clean: COLORS.mossLight };
                return (
                  <button
                    key={level}
                    onClick={() => setCleanliness(level)}
                    disabled={!otpVerified}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 disabled:opacity-40"
                    style={{
                      borderColor: sel ? colors[level] : COLORS.border,
                      backgroundColor: sel ? `${colors[level]}10` : '#fff',
                    }}
                  >
                    <span className="text-[20px]">
                      {level === 'dirty' ? '🟥' : level === 'moderate' ? '🟧' : '🟩'}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color: sel ? colors[level] : COLORS.textMuted }}>
                      {labels[level]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actual verified weight */}
          <div>
            <label className="text-[13px] mb-1.5 block font-semibold" style={{ color: COLORS.text }}>
              Verified weight (kg)
            </label>
            <input
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              placeholder={item.weight}
              inputMode="decimal"
              disabled={!otpVerified}
              className="w-full border rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-colors disabled:opacity-40"
              style={{ borderColor: COLORS.border }}
            />
          </div>

          {/* Payout Method */}
          <div>
            <p className="text-[13px] font-semibold mb-3" style={{ color: COLORS.text }}>
              Payout method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'cash' as PayoutMethod, label: 'Cash', icon: Banknote },
                { id: 'wallet' as PayoutMethod, label: 'In-App Wallet', icon: Wallet },
                { id: 'crypto' as PayoutMethod, label: 'Crypto', icon: Bitcoin },
              ]).map(({ id, label, icon: Icon }) => {
                const sel = payoutMethod === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPayoutMethod(id)}
                    disabled={!otpVerified}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 disabled:opacity-40"
                    style={{
                      borderColor: sel ? COLORS.moss : COLORS.border,
                      backgroundColor: sel ? `${COLORS.moss}0D` : '#fff',
                    }}
                  >
                    <Icon size={20} color={sel ? COLORS.moss : COLORS.textMuted} strokeWidth={2} />
                    <span className="text-[11px] font-semibold" style={{ color: sel ? COLORS.moss : COLORS.textMuted }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => { onCancel(item.id); onClose(); }}
              icon={Ban}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={completeDisabled}
              onClick={() => { onComplete(item.id); onClose(); }}
              icon={CheckCircle2}
              className="flex-1"
            >
              Confirm & Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================  INVENTORY SCREEN  ===================== */

export default function WasteInventoryScreen() {
  const logModalRef = useRef<HTMLIonModalElement>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [items, setItems] = useState<MockWasteItem[]>(MOCK_WASTE_ITEMS);
  const [verifyItem, setVerifyItem] = useState<MockWasteItem | null>(null);

  const handleLogSubmit = (payload: { category: string; item: string; qty: string }) => {
    setToastMessage(`Logged ${payload.qty} kg of ${payload.item}`);
  };

  const handleVerifyComplete = (itemId: string) => {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'completed' as WasteItemStatus } : it));
    setToastMessage('Waste collection verified and completed');
  };

  const handleVerifyCancel = (itemId: string) => {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'pending' as WasteItemStatus } : it));
    setToastMessage('Collection request cancelled');
  };

  return (
    <AppLayout>
      {/* Page heading */}
      <div className="pt-1 pb-2">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Track what you collect
        </p>
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Waste Inventory
        </h1>
      </div>

      <Button id="open-log-waste" variant="primary" full icon={Plus}>
        Log New Waste
      </Button>

      {/* Inventory table */}
      <div>
        <p className="text-[13px] font-semibold mb-3" style={{ color: COLORS.text }}>
          Logged items
        </p>
        <div className="space-y-2">
          {items.map((it) => {
            const st = STATUS_CONFIG[it.status];
            const StIcon = st.icon;
            const CatIcon = CATEGORY_ICONS[it.categoryId as WasteCategoryId];
            return (
              <div
                key={it.id}
                className="rounded-2xl border bg-white overflow-hidden"
                style={{ borderColor: COLORS.border }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${it.color}14` }}
                    >
                      {CatIcon && <CatIcon size={18} color={it.color} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold leading-tight" style={{ color: COLORS.text }}>
                        {it.name}
                      </p>
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: COLORS.textMuted }}>
                        {it.category}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      <StIcon size={12} strokeWidth={2.5} />
                      {st.label}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: COLORS.textMuted }}>Weight</p>
                        <p className="text-[13px] font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>{it.weight}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: COLORS.textMuted }}>Date</p>
                        <p className="text-[13px] font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>{it.date}</p>
                      </div>
                    </div>

                    {it.status === 'pending' && (
                      <button
                        onClick={() => setVerifyItem(it)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-[0.96]"
                        style={{
                          backgroundColor: COLORS.moss,
                          color: '#fff',
                        }}
                      >
                        <ShieldCheck size={14} strokeWidth={2.5} />
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LogWasteSheet
        modalRef={logModalRef}
        onDismiss={() => logModalRef.current?.dismiss()}
        onSubmit={handleLogSubmit}
      />

      <WasteVerifyModal
        open={verifyItem !== null}
        item={verifyItem}
        onClose={() => setVerifyItem(null)}
        onComplete={handleVerifyComplete}
        onCancel={handleVerifyCancel}
      />

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={2200}
        position="bottom"
        onDidDismiss={() => setToastMessage('')}
      />
    </AppLayout>
  );
}