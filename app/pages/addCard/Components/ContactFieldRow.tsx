import { Pressable, type KeyboardTypeOptions } from 'react-native';
import { X } from 'lucide-react-native';
import type { DynamicCardField } from '@/pages/cards/types/card.types';
import { FormField } from './FormField';

const KEYBOARD_BY_TYPE: Record<DynamicCardField['type'], KeyboardTypeOptions> = {
  email: 'email-address',
  phone: 'phone-pad',
  url: 'url',
  text: 'default',
};

type Props = {
  field: DynamicCardField;
  label?: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  /** Omit for rows that are always on the form. */
  onRemove?: () => void;
  autoFocus?: boolean;
};

export function ContactFieldRow({ field, label, placeholder, onChangeText, onRemove, autoFocus }: Props) {
  return (
    <FormField
      autoFocus={autoFocus}
      label={label ?? field.title}
      value={field.value}
      placeholder={placeholder}
      keyboardType={KEYBOARD_BY_TYPE[field.type]}
      autoCapitalize={field.type === 'text' ? 'words' : 'none'}
      onChangeText={onChangeText}
      accessory={
        onRemove ? (
          <Pressable
            accessibilityLabel={`Remove ${field.title}`}
            accessibilityRole="button"
            hitSlop={10}
            onPress={onRemove}
            className="h-6 w-6 items-center justify-center rounded-full bg-slate-100 active:opacity-70 dark:bg-slate-800"
          >
            <X color="#64748b" size={14} strokeWidth={2.6} />
          </Pressable>
        ) : null
      }
    />
  );
}
