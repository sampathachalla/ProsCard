// pages/editView/Components/CardForm.tsx
import { useState } from 'react';
import { Platform, View, Text, TextInput } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import type { CardFieldKey, EditableCard } from '../types/editView.types';

const FIELDS: { key: CardFieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' }[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'title', label: 'Job Title' },
  { key: 'company', label: 'Company Name' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
];

export function CardForm({
  draft,
  onChange,
}: {
  draft: EditableCard;
  onChange: (field: CardFieldKey, value: string) => void;
}) {
  const { theme } = useThemeContext();
  const [focusedKey, setFocusedKey] = useState<CardFieldKey | null>(null);

  return (
    <View>
      {FIELDS.map(({ key, label, keyboardType }) => {
        const isFocused = focusedKey === key;
        return (
          <View key={key} className="mb-5">
            <Text className="mb-2 text-[14px] font-normal text-slate-500 dark:text-slate-400">
              {label}
            </Text>
            <TextInput
              value={draft[key]}
              onChangeText={(value) => onChange(key, value)}
              keyboardType={keyboardType}
              autoCapitalize={key === 'email' ? 'none' : 'sentences'}
              placeholder={label}
              placeholderTextColor={theme === 'dark' ? '#64748b' : '#94a3b8'}
              onFocus={() => setFocusedKey(key)}
              onBlur={() => setFocusedKey((prev) => (prev === key ? null : prev))}
              className={`rounded-lg border px-4 py-3 text-[16px] font-normal text-textPrimary dark:text-dark-textPrimary ${
                isFocused
                  ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
                  : 'border-transparent bg-slate-100 dark:bg-dark-card'
              }`}
              style={[
                { minHeight: 54, textAlignVertical: 'center' },
                Platform.OS === 'android' ? { includeFontPadding: false } : null,
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}
