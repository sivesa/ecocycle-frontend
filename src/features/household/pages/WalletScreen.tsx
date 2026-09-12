import { useRef, useState } from 'react';
import { IonModal, IonToast } from '@ionic/react';
import {
  Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Banknote, X, CheckCircle2,
} from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import { MOCK_BALANCE, MOCK_WALLET_TXS, MOCK_BANKS } from '../data/mockData';
import type { MockBank } from '../data/mockData';

function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '+';
  return `${sign} R${Math.abs(value).toFixed(2)}`;
}

/* ======================  WITHDRAW FLOW  ===================== */

interface WithdrawFlowProps {
  modalRef: React.RefObject<HTMLIonModalElement>;
  balance: number;
  onSuccess: (message: string) => void;
}

function WithdrawFlow({ modalRef, balance, onSuccess }: WithdrawFlowProps) {
  const [step, setStep] = useState<'amount' | 'bank' | 'details' | 'confirm'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<MockBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'cheque' | ''>('');

  const reset = () => {
    setStep('amount');
    setAmount('');
    setSelectedBank(null);
    setAccountNumber('');
    setBranchCode('');
    setAccountType('');
  };

  const close = () => {
    modalRef.current?.dismiss();
    reset();
  };

  const goNext = () => {
    if (step === 'amount') setStep('bank');
    else if (step === 'bank') setStep('details');
    else if (step === 'details') setStep('confirm');
  };

  const goBack = () => {
    if (step === 'bank') setStep('amount');
    else if (step === 'details') setStep('bank');
    else if (step === 'confirm') setStep('details');
  };

  const handleConfirm = () => {
    onSuccess(`R${amount} withdrawal to ${selectedBank?.name} requested`);
    close();
  };

  return (
    <IonModal ref={modalRef} trigger="open-withdraw" initialBreakpoint={0.72} breakpoints={[0, 0.72, 0.95]} onDidDismiss={() => reset()}>
      <div className="px-6 pt-5 pb-8">
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: COLORS.border }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
              {step === 'amount' && 'Withdraw funds'}
              {step === 'bank' && 'Select bank'}
              {step === 'details' && 'Account details'}
              {step === 'confirm' && 'Confirm withdrawal'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: COLORS.textMuted }}>
              {step === 'amount' && `Available balance: R${balance.toFixed(2)}`}
              {step === 'bank' && 'Choose your destination bank'}
              {step === 'details' && `Send to ${selectedBank?.name}`}
              {step === 'confirm' && 'Review and confirm'}
            </p>
          </div>
          <button onClick={close} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition hover:bg-black/5" style={{ color: COLORS.textMuted }}>
            <X size={18} />
          </button>
        </div>

        {/* Step: Amount */}
        {step === 'amount' && (
          <>
            <div className="mb-5">
              <label className="text-[13px] mb-1.5 block font-semibold" style={{ color: COLORS.textMuted }}>
                Amount (ZAR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold" style={{ color: COLORS.textMuted }}>R</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="w-full border rounded-xl pl-9 pr-4 py-3.5 text-[18px] font-bold outline-none transition-colors focus:border-moss"
                  style={{ borderColor: COLORS.border, ...DISPLAY_FONT }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={close} className="flex-1">Cancel</Button>
              <Button variant="primary" disabled={!amount || Number(amount) <= 0 || Number(amount) > balance} onClick={goNext} className="flex-1">Continue</Button>
            </div>
          </>
        )}

        {/* Step: Bank selection */}
        {step === 'bank' && (
          <>
            <div className="space-y-2 mb-5">
              {MOCK_BANKS.map((bank) => {
                const sel = selectedBank?.id === bank.id;
                return (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: sel ? COLORS.moss : COLORS.border,
                      backgroundColor: sel ? `${COLORS.moss}0D` : '#fff',
                    }}
                  >
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: COLORS.text }}>{bank.name}</p>
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: COLORS.textMuted }}>Code: {bank.code}</p>
                    </div>
                    {sel && <CheckCircle2 size={18} color={COLORS.moss} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={goBack} className="flex-1">Back</Button>
              <Button variant="primary" disabled={!selectedBank} onClick={goNext} className="flex-1">Continue</Button>
            </div>
          </>
        )}

        {/* Step: Account details */}
        {step === 'details' && (
          <>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-[13px] mb-1.5 block font-semibold" style={{ color: COLORS.textMuted }}>Account number</label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234567890"
                  inputMode="numeric"
                  className="w-full border rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-colors focus:border-moss"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-[13px] mb-1.5 block font-semibold" style={{ color: COLORS.textMuted }}>Branch code</label>
                <input
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={selectedBank?.code ?? 'e.g. 250655'}
                  inputMode="numeric"
                  className="w-full border rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-colors focus:border-moss"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-[13px] mb-1.5 block font-semibold" style={{ color: COLORS.textMuted }}>Account type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['savings', 'cheque'] as const).map((type) => {
                    const sel = accountType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setAccountType(type)}
                        className="p-3 rounded-xl border text-[13px] font-semibold capitalize transition-all duration-200"
                        style={{
                          borderColor: sel ? COLORS.moss : COLORS.border,
                          backgroundColor: sel ? `${COLORS.moss}0D` : '#fff',
                          color: sel ? COLORS.moss : COLORS.text,
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={goBack} className="flex-1">Back</Button>
              <Button
                variant="primary"
                disabled={!accountNumber || !branchCode || !accountType}
                onClick={goNext}
                className="flex-1"
              >
                Review
              </Button>
            </div>
          </>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: `${COLORS.moss}0A`, border: `1px solid ${COLORS.moss}22` }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>Amount</span>
                  <span className="text-[18px] font-bold" style={{ color: COLORS.text, ...DISPLAY_FONT }}>R{Number(amount).toFixed(2)}</span>
                </div>
                <div className="h-px" style={{ backgroundColor: `${COLORS.moss}22` }} />
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>Bank</span>
                  <span className="text-[13px] font-semibold" style={{ color: COLORS.text }}>{selectedBank?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>Account</span>
                  <span className="text-[13px] font-semibold" style={{ color: COLORS.text }}>****{accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>Type</span>
                  <span className="text-[13px] font-semibold capitalize" style={{ color: COLORS.text }}>{accountType}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={goBack} className="flex-1">Back</Button>
              <Button variant="primary" icon={Banknote} onClick={handleConfirm} className="flex-1">
                Confirm withdrawal
              </Button>
            </div>
          </>
        )}
      </div>
    </IonModal>
  );
}

/* ======================  WALLET SCREEN  ===================== */

export default function WalletScreen() {
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [toastMessage, setToastMessage] = useState('');

  return (
    <AppLayout>
      {/* Page heading */}
      <div className="pt-1 pb-1">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Your earnings
        </p>
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Wallet
        </h1>
      </div>

      {/* Balance card */}
      <div
        className="rounded-[1.5rem] p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.mossLight} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <WalletIcon size={19} color="#fff" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>
                Available balance
              </span>
            </div>
            <button
              id="open-withdraw"
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-[0.96]"
              style={{ backgroundColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
            >
              Withdraw
            </button>
          </div>
          <p className="text-[34px] font-bold leading-none text-white" style={{ ...DISPLAY_FONT }}>
            R{MOCK_BALANCE.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <p className="text-[13px] font-semibold mb-3" style={{ color: COLORS.text }}>
          Transaction history
        </p>
        <div className="space-y-2">
          {MOCK_WALLET_TXS.map((tx) => {
            const isCredit = tx.amount >= 0;
            const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white border transition-shadow duration-200 hover:shadow-[0_2px_12px_-3px_rgba(31,42,34,0.08)]"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isCredit ? `${COLORS.mossLight}14` : `${COLORS.danger}14` }}
                >
                  <Icon size={17} color={isCredit ? COLORS.mossLight : COLORS.danger} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: COLORS.text }}>
                    {tx.label}
                  </p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: COLORS.textMuted }}>
                    {tx.date}
                  </p>
                </div>
                <p
                  className="text-[14px] font-bold shrink-0"
                  style={{ color: isCredit ? COLORS.mossLight : COLORS.danger, ...DISPLAY_FONT }}
                >
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <WithdrawFlow modalRef={modalRef} balance={MOCK_BALANCE} onSuccess={setToastMessage} />

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