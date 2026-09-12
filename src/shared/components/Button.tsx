import React from 'react';
import type { ButtonHTMLAttributes, ComponentType } from 'react';
import { COLORS } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  full?: boolean;
  /** A lucide-react icon component, rendered before the label. */
  icon?: ComponentType<{ size?: number | string; color?: string }>;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Reusable button. Renders a plain <button> styled with Tailwind + a
 * handful of inline styles for the accent colors Tailwind's static
 * classes can't express.
 */
export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  full = false,
  icon: Icon,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium px-4 py-3 transition active:scale-[0.98]';

  const styleFor: React.CSSProperties = {
    primary: { backgroundColor: disabled ? COLORS.border : COLORS.moss, color: '#fff' },
    secondary: { backgroundColor: '#fff', color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost: { backgroundColor: 'transparent', color: COLORS.textMuted },
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      style={styleFor}
      className={`${base} ${full ? 'w-full' : ''} ${disabled ? 'opacity-60' : ''} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
