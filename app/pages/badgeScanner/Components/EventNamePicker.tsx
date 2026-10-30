import { Pressable, TextInput, View } from 'react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  value: string;
  onChangeText: (name: string) => void;
  suggestions: string[];
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
};

/** Type a new event name or tap one used before. */
export function EventNamePicker({ value, onChangeText, suggestions, autoFocus, onSubmitEditing }: Props) {
  const selected = value.trim().toLowerCase();
  return (
    <View>
      <Text variant="none" className="mb-2 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
        Event name
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="e.g. SaaStr Annual 2026"
        placeholderTextColor="#94a3b8"
        autoCapitalize="words"
        autoFocus={autoFocus}
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
        className="rounded-2xl border border-slate-200 bg-card px-4 py-3.5 text-base text-textPrimary dark:border-slate-700 dark:bg-dark-card dark:text-dark-textPrimary"
      />
      {suggestions.length > 0 ? (
        <View className="mt-4">
          <Text variant="none" className="mb-2 text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-dark-textSecondary">
            Your previous events
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((name) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === name.toLowerCase() }}
                onPress={() => onChangeText(name)}
                className={`rounded-full border px-3 py-2 active:opacity-80 ${
                  selected === name.toLowerCase()
                    ? 'border-primary bg-primary/10 dark:border-dark-primary'
                    : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
                }`}
              >
                <Text variant="none" className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
