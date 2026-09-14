// Directory: src/shared/components
import type { InputHTMLAttributes } from 'react';
import { COLORS } from '../theme/tokens';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TextField({ label, id, className = '', ...rest }: TextFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={inputId} className="text-sm mb-1 block" style={{ color: COLORS.textMuted }}>
        {label}
      </label>
      <input
        id={inputId}
        className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: COLORS.border }}
        {...rest}
      />
    </div>
  );
}