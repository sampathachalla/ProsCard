import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LayoutTemplate, Palette, Plus } from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import type { DynamicCardField } from '@/pages/cards/types/card.types';
import { AddCardHeader } from './Components/AddCardHeader';
import { AddContactSheet } from './Components/AddContactSheet';
import { BioField } from './Components/BioField';
import { CardMediaHeader } from './Components/CardMediaHeader';
import { CardTagDropdown } from './Components/CardTagDropdown';
import { ContactFieldRow } from './Components/ContactFieldRow';
import { EditorRow } from './Components/EditorRow';
import { FormField } from './Components/FormField';
import { LayoutSheet } from './Components/LayoutSheet';
import { ThemeSheet } from './Components/ThemeSheet';
import {
  CONTACT_OPTIONS,
  PRIMARY_CONTACTS,
  PRIMARY_CONTACT_IDS,
  PROFILE_TEXT_FIELDS,
  TAGLINE_FIELD,
} from './Config/addCardFields';
import { useAddCard } from './Hooks/useAddCard';
import type { AddCardPanel, AddCardTextFieldId, ContactOption } from './types/addCard.types';

function textValue(
  id: AddCardTextFieldId,
  draft: ReturnType<typeof useAddCard>['draft'],
): string {
  if (id === 'name') return draft.name;
  if (id === 'title') return draft.title;
  if (id === 'company') return draft.company;
  return draft.sectionOverrides[id] ?? '';
}

function contactConfig(field: DynamicCardField) {
  const primary = PRIMARY_CONTACTS.find((item) => item.id === field.id);
  const extra = CONTACT_OPTIONS.find(
    (item) => item.title.toLowerCase() === field.title.toLowerCase(),
  );
  return {
    label: primary?.label ?? field.title,
    placeholder: primary?.placeholder ?? extra?.placeholder,
  };
}

export default function AddCardPage() {
  const router = useRouter();
  const editor = useAddCard();
  const [panel, setPanel] = useState<AddCardPanel>(null);

  const primaryContacts = useMemo(
    () => PRIMARY_CONTACTS.map((config) =>
      editor.draft.connectionFields.find((field) => field.id === config.id),
    ).filter((field): field is DynamicCardField => Boolean(field)),
    [editor.draft.connectionFields],
  );
  const extraContacts = useMemo(
    () => editor.draft.connectionFields.filter((field) => !PRIMARY_CONTACT_IDS.has(field.id)),
    [editor.draft.connectionFields],
  );

  const leave = () => {
    if (!editor.hasChanges) {
      router.replace('/(tabs)/homepage');
      return;
    }
    Alert.alert('Discard this card?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.replace('/(tabs)/homepage') },
    ]);
  };

  const save = async () => {
    const saved = await editor.save();
    if (saved) router.replace('/(tabs)/homepage');
  };

  const addContact = (option: ContactOption) => {
    editor.addContact(option);
    setPanel(null);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <AddCardHeader title="Add card" isSaving={editor.isSaving} onBack={leave} onSave={() => void save()} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[560px] self-center">
            <CardMediaHeader
              coverPhoto={editor.draft.sectionOverrides.coverPhoto ?? ''}
              profilePhoto={editor.draft.sectionOverrides.profilePhoto ?? ''}
              logo={editor.draft.sectionOverrides.logo ?? ''}
              gradient={editor.draft.gradient}
              onChange={editor.setOverride}
            />

            <CardTagDropdown
              value={editor.draft.sectionOverrides.cardTag ?? ''}
              onChange={(value) => editor.setOverride('cardTag', value)}
            />

            <EditorRow
              icon={LayoutTemplate}
              label="Layout"
              value={`${editor.draft.sectionLayouts.identity} · ${editor.draft.sectionLayouts.professional}`}
              onPress={() => setPanel('layout')}
            />
            <EditorRow
              icon={Palette}
              label="Card theme"
              value={editor.draft.cardTheme.customThemeName ?? editor.draft.cardTheme.id}
              onPress={() => setPanel('theme')}
              accessory={
                <LinearGradient
                  colors={editor.draft.cardTheme.gradient}
                  className="mr-2 h-8 w-8 rounded-full"
                />
              }
            />

            <View className="mb-2 mt-4">
              <Text variant="subtitle">Card details</Text>
              <Text variant="muted">Customize what appears on this card.</Text>
            </View>

            {PROFILE_TEXT_FIELDS.map((field) => (
              <FormField
                key={field.id}
                label={field.label}
                value={textValue(field.id, editor.draft)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                autoCapitalize={field.autoCapitalize}
                showCount
                onChangeText={(value) => editor.setTextField(field.id, value)}
              />
            ))}

            <FormField
              label={TAGLINE_FIELD.label}
              value={editor.draft.sectionOverrides.tagline ?? ''}
              placeholder={TAGLINE_FIELD.placeholder}
              maxLength={TAGLINE_FIELD.maxLength}
              autoCapitalize={TAGLINE_FIELD.autoCapitalize}
              showCount
              onChangeText={(value) => editor.setTextField('tagline', value)}
            />

            <BioField
              value={editor.draft.sectionOverrides.bio ?? ''}
              enabled={editor.draft.sectionOverrides.bioEnabled === 'true'}
              onChangeText={(value) => editor.setOverride('bio', value)}
              onToggle={(enabled) => editor.setOverride('bioEnabled', enabled ? 'true' : 'false')}
            />

            <View className="mb-2 mt-4">
              <Text variant="subtitle">Contact methods</Text>
              <Text variant="muted">Add at least the required number of ways to connect.</Text>
            </View>

            {primaryContacts.map((field) => {
              const config = contactConfig(field);
              return (
                <ContactFieldRow
                  key={field.id}
                  field={field}
                  label={config.label}
                  placeholder={config.placeholder}
                  onChangeText={(value) => editor.setContactValue(field.id, value)}
                />
              );
            })}
            {extraContacts.map((field) => {
              const config = contactConfig(field);
              return (
                <ContactFieldRow
                  key={field.id}
                  field={field}
                  label={config.label}
                  placeholder={config.placeholder}
                  onChangeText={(value) => editor.setContactValue(field.id, value)}
                  onRemove={() => editor.removeContact(field.id)}
                />
              );
            })}

            <Pressable
              accessibilityLabel="Add contact method"
              accessibilityRole="button"
              onPress={() => setPanel('contacts')}
              className="min-h-[52px] flex-row items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 px-4 active:opacity-75 dark:border-sky-800 dark:bg-sky-950/20"
            >
              <Plus color="#2563eb" size={19} strokeWidth={2.5} />
              <Text className="ml-2 font-bold text-[#2563eb] dark:text-[#38bdf8]">Add contact</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LayoutSheet
        card={editor.draft}
        visible={panel === 'layout'}
        onClose={() => setPanel(null)}
        onChange={editor.setLayout}
      />
      <ThemeSheet
        card={editor.draft}
        visible={panel === 'theme'}
        onClose={() => setPanel(null)}
        onChange={editor.setTheme}
        onSaveCustomTheme={editor.saveCustomTheme}
      />
      <AddContactSheet
        existing={editor.draft.connectionFields}
        visible={panel === 'contacts'}
        onClose={() => setPanel(null)}
        onAdd={addContact}
      />
    </View>
  );
}
