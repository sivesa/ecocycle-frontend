// Directory: src/features/household/pages
import { useState } from 'react';
import type { ComponentType } from 'react';
import { BookOpen, Recycle, Lightbulb, Droplets, ChevronRight } from 'lucide-react';
import AppLayout from '../../../shared/layout/AppLayout';
import Card from '../../../shared/components/Card';
import { COLORS, DISPLAY_FONT } from '../../../shared/theme/tokens';

interface Article {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  color: string;
  icon: ComponentType<{ size?: number | string; color?: string }>;
}

// Sample data — replace with data from the content/CMS API.
const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Sorting plastics the right way',
    blurb:
      'Know your PET from your HDPE before it hits the bin — the resin code stamped on the bottom tells you which stream it belongs to.',
    minutes: 4,
    color: COLORS.sky,
    icon: Recycle,
  },
  {
    id: 'a2',
    title: 'Why glass never wears out',
    blurb:
      'Glass can be recycled endlessly without losing quality or purity, unlike plastic which degrades a little with every cycle.',
    minutes: 3,
    color: COLORS.mossLight,
    icon: Lightbulb,
  },
  {
    id: 'a3',
    title: 'Composting kitchen scraps at home',
    blurb: 'Turn food waste into garden compost in a few easy steps, even with a small balcony bin.',
    minutes: 5,
    color: COLORS.kraft,
    icon: Droplets,
  },
  
];

export default function EducationScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="pt-1 pb-2">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          Learn as you recycle
        </p>
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          Education
        </h1>
      </div>

      <Card accent={COLORS.moss}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} color={COLORS.moss} />
          <p className="text-sm font-medium" style={{ color: COLORS.text }}>
            This week&apos;s tip
          </p>
        </div>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          Rinse containers before logging them — contaminated recyclables lower the payout rate for your whole
          neighbourhood.
        </p>
      </Card>

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: COLORS.text }}>
          Articles &amp; guides
        </p>
        <div className="space-y-2">
          {ARTICLES.map((article) => {
            const Icon = article.icon;
            const isOpen = openId === article.id;
            return (
              <Card key={article.id} accent={article.color}>
                <button
                  className="w-full flex items-center justify-between gap-3 text-left"
                  onClick={() => setOpenId(isOpen ? null : article.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${article.color}1A` }}
                    >
                      <Icon size={16} color={article.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
                        {article.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                        {article.minutes} min read
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    color={COLORS.textMuted}
                    style={{ transform: isOpen ? 'rotate(90deg)' : undefined, transition: 'transform 150ms' }}
                  />
                </button>
                {isOpen && (
                  <p
                    className="text-sm mt-3 pt-3 border-t"
                    style={{ color: COLORS.textMuted, borderColor: COLORS.border }}
                  >
                    {article.blurb}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}