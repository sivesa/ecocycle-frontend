import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Banknote, TrendingUp } from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import { COLLECTOR_SAMPLE_USER } from '../data/sampleCollector';
import { COLLECTOR_BALANCE, MOCK_PAYOUTS } from '../data/mockData';

function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '+';
  return `${sign} R${Math.abs(value).toFixed(2)}`;
}

export default function EarningsScreen() {
  return (
    <AppLayout user={COLLECTOR_SAMPLE_USER}>
      <div className="pt-1 pb-1">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Your collections balance
        </p>
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Earnings
        </h1>
      </div>

      {/* Balance card */}
      <div
        className="rounded-[1.5rem] p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${COLORS.moss} 0%, ${COLORS.mossLight} 100%)` }}
      >
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
            <Button
              variant="secondary"
              icon={Banknote}
              className="!px-4 !py-2 !text-[12px]"
            >
              Withdraw
            </Button>
          </div>
          <p className="text-[34px] font-bold leading-none text-white" style={DISPLAY_FONT}>
            R{COLLECTOR_BALANCE.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card accent={COLORS.mossLight}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} color={COLORS.mossLight} strokeWidth={2.2} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
              This week
            </p>
          </div>
          <p className="text-[20px] font-bold leading-none" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
            R342.80
          </p>
        </Card>
        <Card accent={COLORS.sky}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Pickups completed
          </p>
          <p className="text-[20px] font-bold leading-none" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
            18
          </p>
        </Card>
      </div>

      {/* Payout history */}
      <div>
        <p className="text-[13px] font-semibold mb-3" style={{ color: COLORS.text }}>
          Payout history
        </p>
        <div className="space-y-2">
          {MOCK_PAYOUTS.map((p) => {
            const isCredit = p.amount >= 0;
            const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white border"
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
                    {p.label}
                  </p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: COLORS.textMuted }}>
                    {p.date}
                  </p>
                </div>
                <p
                  className="text-[14px] font-bold shrink-0"
                  style={{ color: isCredit ? COLORS.mossLight : COLORS.danger, ...DISPLAY_FONT }}
                >
                  {formatCurrency(p.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}