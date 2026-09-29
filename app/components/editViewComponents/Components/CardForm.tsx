// components/editViewComponents/Components/CardForm.tsx
import { View, Text, TextInput } from 'react-native';
import type { CardFieldKey, EditableCard } from '../types/editView.types';

const FIELDS: { key: CardFieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' }[] = [
  { key: 'name', label: 'Full name' },
  { key: 'title', label: 'Job title' },
  { key: 'company', label: 'Company' },
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
  return (
    <View>
      {FIELDS.map(({ key, label, keyboardType }) => (
        <View key={key} className="mb-4">
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-1 ml-1">
            {label}
          </Text>
          <TextInput
            value={draft[key]}
            onChangeText={(value) => onChange(key, value)}
            keyboardType={keyboardType}
            autoCapitalize={key === 'email' ? 'none' : 'sentences'}
            placeholder={label}
            placeholderTextColor="#7A7A7A"
            className="bg-card dark:bg-dark-card rounded-2xl px-4 py-3 text-textPrimary dark:text-dark-textPrimary"
          />
        </View>
      ))}
    </View>
  );
}
