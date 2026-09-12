import { IonSelect, IonSelectOption } from '@ionic/react';
import { COLORS } from '../theme/tokens';
import { DISPLAY_FONT } from '../theme/tokens';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  onValueChange: (value: string) => void;
}

/**
 * Labeled dropdown with the same visual language as `TextField`
 * (label-above, same palette), wrapping Ionic's `IonSelect` so mobile
 * gets the native picker. Used by collector sign-up (vehicle type) and
 * any household/collector form that needs a constrained pick.
 */
export default function Select({
  label,
  value,
  options,
  placeholder = 'Select an option',
  required = false,
  onValueChange,
}: SelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
        {label}
        {required && <span style={{ color: COLORS.danger }}> *</span>}
      </label>
      <div
        className="flex h-11 w-full items-center rounded-xl border bg-white px-3"
        style={{ borderColor: COLORS.border, ...DISPLAY_FONT }}
      >
        <IonSelect
          value={value === '' ? undefined : value}
          placeholder={placeholder}
          className="w-full text-base"
          onIonChange={(e) => onValueChange(String(e.detail.value ?? ''))}
        >
          {options.map((opt) => (
            <IonSelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </div>
    </div>
  );
}
