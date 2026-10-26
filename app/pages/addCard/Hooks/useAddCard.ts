// pages/addCard/Hooks/useAddCard.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  resolveIdentityLayoutId,
  resolveProfessionalLayoutId,
  type BusinessCard,
  type CardLayoutId,
  type CardSectionFieldId,
  type CardSectionId,
  type CardVisualTheme,
  type DynamicCardField,
  type SavedSectionTheme,
} from '@/pages/cards/types/card.types';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { themeFromSavedSectionTheme } from '@/utils/cardThemeColor';
import { buildAddCardDraft, buildAddCardDraftForEditor, createCard } from '../Services/addCardService';
import type { AddCardTextFieldId, ContactOption } from '../types/addCard.types';
import { splitName } from '../Utils/addCardName';
import { validateAddCard } from '../Utils/validateAddCard';

/** Applies one theme to every card section so the whole card matches. */
function withThemeEverywhere(card: BusinessCard, theme: CardVisualTheme): BusinessCard {
  const copy = () => ({ ...theme, gradient: [...theme.gradient] as [string, string] });
  return {
    ...card,
    gradient: [theme.gradient[0], theme.gradient[1]],
    cardTheme: copy(),
    sectionThemes: { identity: copy(), professional: copy(), bio: copy(), connections: copy() },
  };
}

type UseAddCardOptions = {
  cardId?: string;
  creationSession?: string;
};

export function useAddCard(options: UseAddCardOptions = {}) {
  const { profile } = useProfileSnapshot();
  const isEditMode = Boolean(options.cardId);
  const [draft, setDraft] = useState<BusinessCard>(() =>
    buildAddCardDraftForEditor(profile, options.cardId),
  );
  const initialSnapshot = useRef(JSON.stringify(draft));
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = JSON.stringify(draft) !== initialSnapshot.current;

  const setOverride = useCallback((field: CardSectionFieldId, value: string) => {
    setDraft((prev) => ({ ...prev, sectionOverrides: { ...prev.sectionOverrides, [field]: value } }));
  }, []);

  const setTextField = useCallback((field: AddCardTextFieldId, value: string) => {
    setDraft((prev) => {
      if (field === 'name') {
        return { ...prev, name: value, sectionOverrides: { ...prev.sectionOverrides, preferredName: value, ...splitName(value) } };
      }
      return {
        ...prev,
        ...(field === 'title' ? { title: value } : {}),
        ...(field === 'company' ? { company: value } : {}),
        sectionOverrides: { ...prev.sectionOverrides, [field]: value },
      };
    });
  }, []);

  const setContactValue = useCallback((id: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      connectionFields: prev.connectionFields.map((field) => (field.id === id ? { ...field, value } : field)),
    }));
  }, []);

  /** Adds an empty contact row (or reuses the existing one for that kind) and returns its id. */
  const addContact = useCallback((option: ContactOption, primaryId?: string) => {
    const id = primaryId ?? `${option.title.toLowerCase().replace(/[^a-z0-9]/g, '') || 'custom'}-${Date.now()}`;
    setDraft((prev) => {
      if (prev.connectionFields.some((field) => field.id === id)) return prev;
      const field: DynamicCardField = { id, title: option.title, type: option.type, value: '' };
      return { ...prev, connectionFields: [...prev.connectionFields, field] };
    });
    return id;
  }, []);

  const removeContact = useCallback((id: string) => {
    setDraft((prev) => ({ ...prev, connectionFields: prev.connectionFields.filter((field) => field.id !== id) }));
  }, []);

  const setLayout = useCallback((section: CardSectionId, layout: CardLayoutId) => {
    const resolved =
      section === 'identity'
        ? resolveIdentityLayoutId(layout)
        : section === 'professional'
          ? resolveProfessionalLayoutId(layout)
          : layout;
    setDraft((prev) => ({ ...prev, sectionLayouts: { ...prev.sectionLayouts, [section]: resolved } }));
  }, []);

  const setTheme = useCallback((theme: CardVisualTheme) => {
    setDraft((prev) => withThemeEverywhere(prev, theme));
  }, []);

  const saveCustomTheme = useCallback((entry: SavedSectionTheme) => {
    setDraft((prev) =>
      withThemeEverywhere(
        { ...prev, customThemes: [entry, ...(prev.customThemes ?? []).filter((item) => item.id !== entry.id)] },
        themeFromSavedSectionTheme(entry, prev.cardTheme.fontStyle),
      ),
    );
  }, []);

  const reset = useCallback(() => {
    const next = isEditMode
      ? buildAddCardDraftForEditor(profile, options.cardId)
      : buildAddCardDraft(profile);
    initialSnapshot.current = JSON.stringify(next);
    setDraft(next);
  }, [isEditMode, options.cardId, profile]);

  useEffect(() => {
    if (!options.creationSession || isEditMode) return;
    const next = buildAddCardDraft(profile);
    initialSnapshot.current = JSON.stringify(next);
    setDraft(next);
  }, [isEditMode, options.creationSession, profile]);

  // The profile loads after first render; re-prefill until the user starts typing.
  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;
  useEffect(() => {
    if (isEditMode) return;
    if (!hasChangesRef.current) reset();
  }, [isEditMode, reset]);

  /** Validates for preview/save. Returns false and explains what is missing when invalid. */
  const checkReady = useCallback(() => {
    const problem = validateAddCard(draft);
    if (!problem) return true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(problem.title, problem.message);
    return false;
  }, [draft]);

  const save = useCallback(async () => {
    if (isSaving || !checkReady()) return null;
    setIsSaving(true);
    try {
      const saved = await createCard(draft);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return saved;
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : isEditMode ? 'Could not save this card.' : 'Could not create this card.',
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [checkReady, draft, isEditMode, isSaving]);

  return {
    draft,
    profile,
    hasChanges,
    isEditMode,
    isSaving,
    setOverride,
    setTextField,
    setContactValue,
    addContact,
    removeContact,
    setLayout,
    setTheme,
    saveCustomTheme,
    save,
    reset,
  };
}
