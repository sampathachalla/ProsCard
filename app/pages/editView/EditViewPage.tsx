import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardSectionEditor } from '@/pages/editView/Components/CardSectionEditor';
import { ContactMethodsRequiredModal } from '@/pages/editView/Components/ContactMethodsRequiredModal';
import { CardPreviewModal } from '@/pages/previewCard/Components/CardPreviewModal';
import { EditCardFormHeader } from '@/pages/editView/Components/EditCardFormHeader';
import { DraggablePreviewButton } from '@/common/ui/DraggablePreviewButton';
import type { EditHomeTab } from '@/common/ui/EditHomeBar';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { saveProfile } from '@/pages/profile/Services/profileService';
import {
  connectionCounts,
  connectionProfileKey,
  MINIMUM_CARD_CONNECTION_FIELDS,
  profileValueForConnection,
  profileConnectionsChanged,
  profileWithConnectionFields,
  reusableConnectionValue,
} from '@/pages/profile/Services/profileConnections';
import type { CardSectionId, DynamicCardField } from '@/pages/cards/types/card.types';
import { buildDefaultCard, getCards } from '@/pages/cards/Services/cardsService';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import { useEditView } from '@/pages/editView/Hooks/useEditView';
import type { EditableCard } from '@/pages/editView/types/editView.types';

export default function EditViewPage() {
  const params = useLocalSearchParams<{
    cardId?: string | string[];
    create?: string | string[];
    creationSession?: string | string[];
    origin?: string | string[];
  }>();
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const createParam = Array.isArray(params.create) ? params.create[0] : params.create;
  const creationSession = Array.isArray(params.creationSession)
    ? params.creationSession[0]
    : params.creationSession;
  const isCreateMode = createParam === '1';
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { profile } = useProfileSnapshot();
  const [creationDraft] = useState(() => buildDefaultCard(profile));
  const [activeSection] = useState<CardSectionId>('identity');
  const [activeEditTab] = useState<EditHomeTab>('content');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [cardTagRequiredError, setCardTagRequiredError] = useState(false);
  const [missingContactMethodCount, setMissingContactMethodCount] = useState<number | null>(null);
  const connectionScopeChoices = useRef<Record<string, 'card' | 'account'>>({});
  const recordConnectionScope = useCallback((field: DynamicCardField, scope: 'card' | 'account') => {
    const key = connectionProfileKey(field);
    if (key) connectionScopeChoices.current[key] = scope;
  }, []);
  const syncProfileConnections = useCallback(async (candidate: EditableCard) => {
    if (!candidate.connectionFieldsCustomized) return;
    const fieldsToSync: EditableCard['connectionFields'] = [];
    for (const field of candidate.connectionFields) {
      const value = field.value.trim();
      if (!value || !connectionProfileKey(field)) continue;
      const savedValue = reusableConnectionValue(profile, getCards(), undefined, field);
      const profileKey = connectionProfileKey(field)!;
      if (savedValue && savedValue !== value && connectionScopeChoices.current[profileKey] === 'card') {
        if (!profileValueForConnection(profile, field).trim()) {
          fieldsToSync.push({ ...field, value: savedValue });
        }
        continue;
      }
      fieldsToSync.push(field);
    }
    const nextProfile = profileWithConnectionFields(profile, fieldsToSync);
    if (profileConnectionsChanged(profile, nextProfile)) await saveProfile(nextProfile);
  }, [profile]);
  const {
    card,
    draft,
    hasChanges,
    isEditing,
    isSaving,
    startEditing,
    updateSectionLayout,
    updateSectionField,
    replaceConnectionFields,
    updateSectionTheme,
    saveCustomSectionTheme,
    submit,
    resetEditor,
  } = useEditView(
    cardId,
    isCreateMode,
    isCreateMode ? creationDraft : undefined,
    syncProfileConnections,
  );

  useEffect(() => {
    startEditing();
  }, [startEditing]);

  useEffect(() => {
    connectionScopeChoices.current = {};
  }, [cardId]);

  useEffect(() => {
    if (!isCreateMode || !creationSession) return;
    const frame = requestAnimationFrame(() => {
      resetEditor(creationDraft, true);
      setPreviewVisible(false);
      setCardTagRequiredError(false);
      connectionScopeChoices.current = {};
    });
    return () => cancelAnimationFrame(frame);
  }, [creationDraft, creationSession, isCreateMode, resetEditor]);

  const handleHeaderBack = useCallback(() => {
    if (previewVisible) {
      setPreviewVisible(false);
      return;
    }
    if (isCreateMode) {
      Alert.alert('Discard new card?', 'Your card has not been created yet. All changes in this setup will be discarded.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
      return;
    }
    if (hasChanges) {
      Alert.alert('Discard changes?', 'Unsaved changes will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/homepage');
  }, [hasChanges, isCreateMode, previewVisible, router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleHeaderBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleHeaderBack]);

  const requireContactFields = () => {
    const fields =
      createCardDetailTemplate(draft, profile)
        .find((section) => section.id === 'connections')
        ?.fields.map((field) => ({
          id: field.id,
          title: field.title,
          type: field.type === 'image' || field.type === 'multiline' ? ('text' as const) : field.type,
          value: field.value,
        })) ?? [];
    const { total } = connectionCounts(fields);
    if (total >= MINIMUM_CARD_CONNECTION_FIELDS) return true;

    setPreviewVisible(false);
    setMissingContactMethodCount(MINIMUM_CARD_CONNECTION_FIELDS - total);
    return false;
  };

  const requireCardTag = () => {
    if (draft.sectionOverrides.cardTag?.trim()) {
      setCardTagRequiredError(false);
      return true;
    }
    setCardTagRequiredError(true);
    Alert.alert(
      'Select a card tag',
      'A card tag is required. Choose Business, Personal, Networking, or Portfolio before saving.',
    );
    return false;
  };

  const saveAllChanges = async () => {
    if (isCreateMode && !requireCardTag()) return;
    if (!requireContactFields()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const saved = await submit({ keepEditing: !isCreateMode });
    if (saved && isCreateMode) router.back();
  };

  const previewCard = () => {
    Haptics.selectionAsync().catch(() => {});
    setPreviewVisible(true);
  };

  const closePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPreviewVisible(false);
  };

  const previewCardData = isEditing ? draft : card;

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <EditCardFormHeader
        isCreateMode={isCreateMode}
        isSaving={isSaving}
        saveDisabled={!isCreateMode && !hasChanges}
        onBack={handleHeaderBack}
        onSave={saveAllChanges}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Math.max(safeAreaInsets.bottom, 16) + 24,
          }}
        >
          <CardSectionEditor
            activeEditTab={activeEditTab}
            activeSection={activeSection}
            card={draft}
            cardTagRequired={isCreateMode}
            cardTagRequiredError={cardTagRequiredError}
            formLayout
            fullOpen
            profile={profile}
            showSectionNavigation={false}
            stylingOpen={false}
            onActiveSectionChange={() => {}}
            onConnectionScopeDecision={recordConnectionScope}
            onConnectionsChange={replaceConnectionFields}
            onFieldChange={(field, value) => {
              updateSectionField(field, value);
              if (field === 'cardTag' && value.trim()) setCardTagRequiredError(false);
            }}
            onLayoutChange={updateSectionLayout}
            onCloseStyling={() => {}}
            onOpenStyling={() => {}}
            onThemeChange={updateSectionTheme}
            onSaveCustomTheme={saveCustomSectionTheme}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <DraggablePreviewButton onPress={previewCard} />

      <ContactMethodsRequiredModal
        minimumCount={MINIMUM_CARD_CONNECTION_FIELDS}
        missingCount={missingContactMethodCount ?? 0}
        visible={missingContactMethodCount !== null}
        onContinue={() => setMissingContactMethodCount(null)}
      />

      <CardPreviewModal
        card={previewCardData}
        insets={safeAreaInsets}
        profile={profile}
        viewportHeight={windowHeight}
        visible={previewVisible}
        onClose={closePreview}
      />
    </View>
  );
}
