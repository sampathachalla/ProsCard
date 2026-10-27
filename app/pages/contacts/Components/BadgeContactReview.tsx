import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, Building2, User } from 'lucide-react-native';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import type { ProcessedCard } from '@/pages/scanner/types/scanner.types';
import type { BadgeContactFields } from '@/pages/scanner/types/badge.types';

export type BadgeFormValues = BadgeContactFields & { notes: string };

type Props = {
  eventName: string;
  initialValues: BadgeFormValues;
  initialCard: ProcessedCard | null;
  onSave: (values: BadgeFormValues, card: ProcessedCard | null) => Promise<void>;
  onCancel: () => void;
};

const EMPTY: BadgeFormValues = { name: '', title: '', company: '', notes: '' };

export function emptyBadgeForm(fields?: Partial<BadgeContactFields>): BadgeFormValues {
  return {
    ...EMPTY,
    name: fields?.name?.trim() ?? '',
    title: fields?.title?.trim() ?? '',
    company: fields?.company?.trim() ?? '',
  };
}

export function BadgeContactReview({ eventName, initialValues, initialCard, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(initialValues);
  const [card] = useState(initialCard);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => values.name.trim().length > 0 && eventName.trim().length > 0, [eventName, values.name]);

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave(
        {
          name: values.name.trim(),
          title: values.title.trim(),
          company: values.company.trim(),
          notes: values.notes.trim(),
        },
        card,
      );
    } catch (reason) {
      Alert.alert('Save failed', reason instanceof Error ? reason.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof BadgeFormValues, label: string, placeholder: string, Icon: typeof User) => (
    <View className="mb-4">
      <Text variant="none" className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-dark-textSecondary">
        {label}
      </Text>
      <View className="flex-row items-center rounded-2xl border border-slate-200 bg-card px-3 dark:border-slate-700 dark:bg-dark-card">
        <Icon color="#64748b" size={18} />
        <TextInput
          value={values[key]}
          onChangeText={(text) => setValues((current) => ({ ...current, [key]: text }))}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          className="ml-2 flex-1 py-3 text-base text-textPrimary dark:text-dark-textPrimary"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 dark:border-dark-primary/30 dark:bg-primary/10">
          <Text variant="none" className="text-xs font-semibold uppercase text-primary dark:text-dark-primary">
            Event
          </Text>
          <Text variant="none" className="mt-1 text-lg font-bold text-textPrimary dark:text-dark-textPrimary">
            {eventName}
          </Text>
        </View>
        {card ? (
          <Image
            source={{ uri: card.uri }}
            style={{ width: '100%', aspectRatio: 1.6, borderRadius: 16, marginBottom: 16, backgroundColor: '#e2e8f0' }}
            contentFit="contain"
          />
        ) : null}
        {field('name', 'Name', 'Attendee name', User)}
        {field('title', 'Title', 'Role on badge (optional)', Briefcase)}
        {field('company', 'Company', 'Organization (optional)', Building2)}
        {field('notes', 'Notes', 'Booth, follow-up, etc.', User)}
        <View className="mt-2 gap-3">
          <Button label={saving ? 'Saving…' : 'Save to contacts'} onPress={save} disabled={!canSave || saving} />
          <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={saving} />
        </View>
        {saving ? <ActivityIndicator color={Colors.light.tint} style={{ marginTop: 12 }} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
