import type { ReactNode } from 'react';
import { TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/common/ui/Text';

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onChangeText: (value: string) => void;
  /** Rendered at the right of the label row (e.g. a switch or remove button). */
  accessory?: ReactNode;
  showCount?: boolean;
  onFocus?: () => void;
  onEndEditing?: () => void;
};

/** Boxed input with its label inside the box, one per line as in the card form sketch. */
export function FormField({
  label,
  value,
  placeholder,
  maxLength,
  multiline = false,
  keyboardType,
  autoCapitalize,
  onChangeText,
  accessory,
  showCount = false,
  onFocus,
  onEndEditing,
}: Props) {
  const { theme } = useThemeContext();

  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-card px-4 pb-2 pt-2.5 dark:border-slate-800 dark:bg-dark-card">
      <View className="min-h-[20px] flex-row items-center">
        <Text variant="tiny" className="flex-1 uppercase tracking-wider">
          {label}
        </Text>
        {showCount && maxLength ? (
          <Text variant="tiny" className="mr-2">
            {value.length}/{maxLength}
          </Text>
        ) : null}
        {accessory}
      </View>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize ?? (keyboardType === 'email-address' ? 'none' : 'sentences')}
        autoCorrect={!keyboardType || keyboardType === 'default'}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onEndEditing={onEndEditing}
        className="py-1.5 text-base text-textPrimary dark:text-dark-textPrimary"
        style={[
          { color: theme === 'dark' ? '#f8fafc' : '#0f172a' },
          multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
        ]}
      />
    </View>
  );
}
