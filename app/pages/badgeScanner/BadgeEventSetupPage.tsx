import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/common/ui/PageHeader';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { useContacts } from '@/pages/contacts/Hooks/useContacts';
import {
  loadRecentEventNames,
  mergeEventNameSuggestions,
  rememberEventName,
} from '@/pages/contacts/Services/eventNamesService';

/** Pick the event before opening the badge camera. */
export default function BadgeEventSetupPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contacts } = useContacts();
  const [eventName, setEventName] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    void loadRecentEventNames().then(setRecent);
  }, []);

  const suggestions = useMemo(() => mergeEventNameSuggestions(contacts, recent), [contacts, recent]);

  const startScan = async () => {
    const trimmed = eventName.trim();
    if (!trimmed) return;
    await rememberEventName(trimmed);
    router.push({
      pathname: '/scanner',
      params: { mode: 'badge', eventName: trimmed },
    });
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Event badge scan" subtitle="Choose the event, then scan attendee badges" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="none" className="mb-2 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
            Event name
          </Text>
          <TextInput
            value={eventName}
            onChangeText={setEventName}
            placeholder="e.g. SaaStr Annual 2026"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
            className="rounded-2xl border border-slate-200 bg-card px-4 py-3.5 text-base text-textPrimary dark:border-slate-700 dark:bg-dark-card dark:text-dark-textPrimary"
          />
          {suggestions.length > 0 ? (
            <View className="mt-4">
              <Text variant="none" className="mb-2 text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-dark-textSecondary">
                Recent & saved events
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {suggestions.map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => setEventName(name)}
                    className={`rounded-full border px-3 py-2 active:opacity-80 ${
                      eventName.trim().toLowerCase() === name.toLowerCase()
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
          <View className="mt-8">
            <Button label="Continue to scanner" onPress={startScan} disabled={!eventName.trim()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
