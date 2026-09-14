// Directory: src/features/household/pages
import { Trash2, Clock, TrendingUp, TrendingDown, Award, Leaf } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import { useAuth } from '../../../shared/context/AuthContext';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';
import type { MonthlyWaste } from '../../../shared/theme/tokens';

const monthlyData: MonthlyWaste[] = [
  { month: 'Feb', kg: 18 },
  { month: 'Mar', kg: 24 },
  { month: 'Apr', kg: 21 },
  { month: 'May', kg: 30 },
  { month: 'Jun', kg: 27 },
  { month: 'Jul', kg: 35 },
  { month: 'Aug', kg: 41 },
];

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  const color = positive ? COLORS.mossLight : COLORS.danger;
  const bg = positive ? `${COLORS.mossLight}18` : `${COLORS.danger}18`;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {positive ? '+' : ''}
      {value}%
    </span>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const householdName = user ? `${user.firstName}'s household` : 'Your household';

  return (
    <AppLayout>
      {/* Page greeting */}
      <div className="pt-1 pb-2">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Good morning
        </p>
        <h1
          className="text-[22px] font-semibold leading-tight"
          style={{ color: COLORS.text, ...DISPLAY_FONT }}
        >
          {householdName}
        </h1>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Collections */}
        <Card accent={COLORS.moss}>
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.moss}15` }}
            >
              <Trash2 size={18} color={COLORS.moss} strokeWidth={2} />
            </div>
            <TrendBadge value={12} />
          </div>
          <p
            className="text-[28px] font-bold leading-none"
            style={{ color: COLORS.text, ...DISPLAY_FONT }}
          >
            36
          </p>
          <p
            className="text-[11px] mt-1 font-medium"
            style={{ color: COLORS.textMuted }}
          >
            Collections this month
          </p>
        </Card>

        {/* Pending Pickups */}
        <Card accent={COLORS.kraft}>
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.kraft}15` }}
            >
              <Clock size={18} color={COLORS.kraft} strokeWidth={2} />
            </div>
            <TrendBadge value={-8} />
          </div>
          <p
            className="text-[28px] font-bold leading-none"
            style={{ color: COLORS.text, ...DISPLAY_FONT }}
          >
            3
          </p>
          <p
            className="text-[11px] mt-1 font-medium"
            style={{ color: COLORS.textMuted }}
          >
            Pending pickup requests
          </p>
        </Card>
      </div>

      {/* Recycling Impact */}
      <Card accent={COLORS.sky}>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-[12px] flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.sky}15` }}
          >
            <Leaf size={15} color={COLORS.sky} strokeWidth={2} />
          </div>
          <p
            className="text-[13px] font-semibold"
            style={{ color: COLORS.text }}
          >
            Recycling impact
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p
              className="text-[20px] font-bold leading-none"
              style={{ color: COLORS.text, ...DISPLAY_FONT }}
            >
              41 kg
            </p>
            <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS.textMuted }}>
              This month
            </p>
          </div>
          <div>
            <p
              className="text-[20px] font-bold leading-none"
              style={{ color: COLORS.mossLight, ...DISPLAY_FONT }}
            >
              28 kg
            </p>
            <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS.textMuted }}>
              CO2 saved
            </p>
          </div>
          <div>
            <p
              className="text-[20px] font-bold flex items-center gap-1 leading-none"
              style={{ color: COLORS.text, ...DISPLAY_FONT }}
            >
              <Award size={15} color={COLORS.kraft} strokeWidth={2} />
              #4
            </p>
            <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS.textMuted }}>
              Neighbourhood rank
            </p>
          </div>
        </div>
      </Card>

      {/* Monthly Waste Chart */}
      <Card>
        <p
          className="text-[13px] font-semibold mb-4"
          style={{ color: COLORS.text }}
        >
          Monthly collected waste
        </p>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.border} strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v} kg`, 'Collected']}
                cursor={{ fill: `${COLORS.moss}0A`, radius: 6 }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  fontSize: 12,
                  fontWeight: 600,
                  ...DISPLAY_FONT,
                }}
              />
              <Bar
                dataKey="kg"
                fill={COLORS.moss}
                radius={[6, 6, 0, 0]}
                barSize={26}
                fillOpacity={0.88}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AppLayout>
  );
}