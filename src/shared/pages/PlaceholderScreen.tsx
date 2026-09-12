import AppLayout from '../layout/AppLayout';
import { COLORS, DISPLAY_FONT } from '../theme/tokens';

export interface PlaceholderScreenProps {
  title: string;
  message: string;
  backHref?: string;
}

export default function PlaceholderScreen({ title, message, backHref }: PlaceholderScreenProps) {
  return (
    <AppLayout backHref={backHref}>
      <div className="pt-1 pb-2">
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: COLORS.text, ...DISPLAY_FONT }}>
          {title}
        </h1>
      </div>
      <div className="h-[50vh] flex items-center justify-center text-center">
        <p className="text-[13px] font-medium" style={{ color: COLORS.textMuted }}>
          {message}
        </p>
      </div>
    </AppLayout>
  );
}