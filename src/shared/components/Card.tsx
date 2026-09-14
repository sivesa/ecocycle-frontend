// Directory: src/shared/components
import type { PropsWithChildren } from 'react';
import { COLORS } from '../theme/tokens';

export interface CardProps extends PropsWithChildren {
  accent?: string;
  className?: string;
}

export default function Card({ children, accent, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-[1.25rem] border overflow-hidden transition-shadow duration-200 hover:shadow-[0_2px_12px_-3px_rgba(31,42,34,0.08)] ${className}`}
      style={{
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
      }}
    >
      <div className="flex">
        {accent && (
          <div
            className="w-[3px] shrink-0 rounded-l-[1.25rem]"
            style={{ backgroundColor: accent }}
          />
        )}
        <div className="flex-1 p-[18px]">{children}</div>
      </div>
    </div>
  );
}