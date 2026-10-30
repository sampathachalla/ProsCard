import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardPreviewModal } from '@/pages/previewCard/Components/CardPreviewModal';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import type { DynamicCardField } from '@/pages/cards/types/card.types';
import { AddCardHeader } from './Components/AddCardHeader';
import { AddContactSheet } from './Components/AddContactSheet';
import { QuickAddContacts } from './Components/QuickAddContacts';
import { BioField } from './Components/BioField';
import { CardMediaHeader } from './Components/CardMediaHeader';
import { CardTagDropdown } from './Components/CardTagDropdown';
import { ContactFieldRow } from './Components/ContactFieldRow';
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
import type { AddCardImageField, AddCardPanel, AddCardTextFieldId, ContactOption } from './types/addCard.types';
import { validateAddCard } from './Utils/validateAddCard';
import type { AccountScopedCardField } from './Utils/accountFieldScope';

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
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const { profile } = useProfileSnapshot();
  const params = useLocalSearchParams<{
    cardId?: string | string[];
    create?: string | string[];
    session?: string | string[];
  }>();
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const createParam = Array.isArray(params.create) ? params.create[0] : params.create;
  const creationSession = Array.isArray(params.session) ? params.session[0] : params.session;
  const isCreateFlow = createParam === '1' || !cardId;
  const editor = useAddCard({
    cardId: isCreateFlow ? undefined : cardId,
    creationSession: isCreateFlow ? creationSession : undefined,
  });
  const [panel, setPanel] = useState<AddCardPanel>(null);
  /** The contact row just added, so its input takes focus right away. */
  const [addedContactId, setAddedContactId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldValueOnFocus = useRef<Partial<Record<AccountScopedCardField, string>>>({});

  useEffect(() => () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
  }, []);

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
    const goBack = () => {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/homepage');
    };
    if (!editor.hasChanges) {
      goBack();
      return;
    }
    Alert.alert(
      editor.isEditMode ? 'Discard changes?' : 'Discard this card?',
      'Your unsaved changes will be lost.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: goBack },
      ],
    );
  };

  const validate = () => {
    const problem = validateAddCard(editor.draft);
    if (problem) {
      Alert.alert(problem.title, problem.message);
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const saved = await editor.save();
    if (!saved) return;
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/homepage');
  };

  const preview = () => {
    Haptics.selectionAsync().catch(() => {});
    setPreviewVisible(true);
  };

  const previewFromDesignPanel = () => {
    Haptics.selectionAsync().catch(() => {});
    setPanel(null);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    // iOS must finish dismissing the page-sheet before presenting the full-screen modal.
    previewTimer.current = setTimeout(() => {
      previewTimer.current = null;
      setPreviewVisible(true);
    }, Platform.OS === 'ios' ? 450 : 50);
  };

  const addContact = (option: ContactOption) => {
    setAddedContactId(editor.addContact(option));
    setPanel(null);
  };

  const rememberFieldValue = (field: AccountScopedCardField, value: string) => {
    fieldValueOnFocus.current[field] = value;
  };

  const chooseFieldScope = (field: AccountScopedCardField, label: string, value: string) => {
    const startingValue = fieldValueOnFocus.current[field];
    delete fieldValueOnFocus.current[field];
    if (startingValue === undefined || startingValue === value) return;
    Alert.alert(
      `Save ${label.toLowerCase()} change`,
      'Where should this change apply?',
      [
        { text: 'This card only', style: 'cancel' },
        {
          text: 'Account & this card',
          onPress: () => void editor.saveFieldToAccount(field, value),
        },
      ],
    );
  };

  const handleMediaChange = (field: AddCardImageField, value: string) => {
    editor.setOverride(field, value);

    const labels: Record<AddCardImageField, string> = {
      coverPhoto: 'Cover photo',
      profilePhoto: 'Profile photo',
      logo: 'Logo',
    };
    const label = labels[field];

    const currentAccountValue =
      field === 'coverPhoto'
        ? (profile.coverPhotoUrl ?? '')
        : field === 'profilePhoto'
          ? (profile.photoUrl ?? '')
          : (profile.companyLogoUrl ?? '');

    if ((currentAccountValue || '') === (value || '')) {
      return;
    }

    const prompt = () => {
      Alert.alert(
        `Save ${label.toLowerCase()} change`,
        'Where should this change apply?',
        [
          { text: 'This card only', style: 'cancel' },
          {
            text: 'Account & this card',
            onPress: () => void editor.saveFieldToAccount(field, value),
          },
        ],
      );
    };

    setTimeout(prompt, Platform.OS === 'ios' ? 350 : 50);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <AddCardHeader
        title={editor.isEditMode ? 'Edit card' : 'Add card'}
        isSaving={editor.isSaving}
        onBack={leave}
        onPreview={preview}
        onSave={() => void save()}
      />

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
              coverPhoto={editor.draft.sectionOverrides.coverPhoto?.trim() || profile.coverPhotoUrl || ''}
              profilePhoto={editor.draft.sectionOverrides.profilePhoto?.trim() || profile.photoUrl || ''}
              logo={editor.draft.sectionOverrides.logo?.trim() || profile.companyLogoUrl || ''}
              logoBackdrop={editor.draft.sectionOverrides.logoBackdrop ?? '#f8fafc'}
              gradient={editor.draft.gradient}
              uploadScope="card"
              uploadCardId={editor.isEditMode ? editor.draft.id : undefined}
              onChange={handleMediaChange}
              onAutoThemeFromLogo={editor.setTheme}
              onPaletteExtracted={editor.applyLogoThemes}
            />

            <CardTagDropdown
              value={editor.draft.sectionOverrides.cardTag ?? ''}
              layoutValue={`${editor.draft.sectionLayouts.identity} · ${editor.draft.sectionLayouts.professional} · ${editor.draft.sectionLayouts.connections}`}
              themeValue={`${editor.draft.cardTheme.customThemeName ?? editor.draft.cardTheme.id} · ${editor.draft.cardTheme.fontStyle}`}
              onChange={editor.applyCardTag}
              onCustomizeLayout={() => setPanel('layout')}
              onCustomizeTheme={() => setPanel('theme')}
            />

            <View className="h-3" />

            <FormField
              label="Card name"
              value={editor.draft.displayName ?? editor.draft.sectionOverrides.displayName ?? ''}
              placeholder="Automatically named from the card tag"
              maxLength={100}
              autoCapitalize="words"
              showCount
              onChangeText={editor.setDisplayName}
            />

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
                onFocus={() => rememberFieldValue(field.id, textValue(field.id, editor.draft))}
                onEndEditing={() => chooseFieldScope(field.id, field.label, textValue(field.id, editor.draft))}
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
              onFocus={() => rememberFieldValue('tagline', editor.draft.sectionOverrides.tagline ?? '')}
              onEndEditing={() => chooseFieldScope('tagline', TAGLINE_FIELD.label, editor.draft.sectionOverrides.tagline ?? '')}
            />

            <BioField
              value={editor.draft.sectionOverrides.bio ?? ''}
              enabled={editor.draft.sectionOverrides.bioEnabled === 'true'}
              onChangeText={(value) => editor.setOverride('bio', value)}
              onToggle={(enabled) => editor.setOverride('bioEnabled', enabled ? 'true' : 'false')}
              onFocus={() => rememberFieldValue('bio', editor.draft.sectionOverrides.bio ?? '')}
              onEndEditing={() => chooseFieldScope('bio', 'Bio', editor.draft.sectionOverrides.bio ?? '')}
            />

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
                  autoFocus={field.id === addedContactId}
                />
              );
              })}

            <QuickAddContacts
              existing={editor.draft.connectionFields}
              pendingFieldId={addedContactId}
              onConfirm={() => setAddedContactId(null)}
              onMore={() => setPanel('contacts')}
            />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LayoutSheet
        card={editor.draft}
        visible={panel === 'layout'}
        onClose={() => setPanel(null)}
        onPreview={previewFromDesignPanel}
        onChange={editor.setLayout}
      />
      <ThemeSheet
        card={editor.draft}
        visible={panel === 'theme'}
        onClose={() => setPanel(null)}
        onPreview={previewFromDesignPanel}
        onChange={editor.setTheme}
        onSaveCustomTheme={editor.saveCustomTheme}
      />
      <AddContactSheet
        existing={editor.draft.connectionFields}
        visible={panel === 'contacts'}
        onClose={() => setPanel(null)}
        onAdd={addContact}
      />
      <CardPreviewModal
        card={editor.draft}
        insets={insets}
        profile={profile}
        viewportHeight={viewportHeight}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      />
    </View>
  );
}
