// pages/addCard/Hooks/useAddCard.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  resolveConnectionsLayoutId,
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
import { useCardTagDesignPreference } from '@/pages/profile/Hooks/useCardTagDesignPreference';
import { useLogoThemePreference } from '@/pages/profile/Hooks/useLogoThemePreference';
import type { LogoPalette } from '@/services/api/types';
import { buildDynamicTagThemes, themeFromSavedSectionTheme } from '@/utils/cardThemeColor';
import { buildAddCardDraft, buildAddCardDraftForEditor, buildAddCardDraftFromCard, createCard } from '../Services/addCardService';
import type { AddCardTextFieldId, ContactOption } from '../types/addCard.types';
import { splitName } from '../Utils/addCardName';
import { validateAddCard } from '../Utils/validateAddCard';
import {
  applyCardTagDesign,
  type CardTag,
  getCardTagDesignPreset,
  isCardTag,
} from '../Config/cardTagDesignPresets';
import { getCachedLogoPalette } from '@/pages/profile/Services/mediaService';
import { saveProfile } from '@/pages/profile/Services/profileService';
import { applyCardFieldToProfile, type AccountScopedCardField } from '../Utils/accountFieldScope';

/** Applies one theme to every card section so the whole card matches. */
function withThemeEverywhere(card: BusinessCard, theme: CardVisualTheme): BusinessCard {
  const copy = () => ({ ...theme, gradient: [...theme.gradient] as [string, string] });
  return {
    ...card,
    gradient: [theme.gradient[0], theme.gradient[1]],
    cardTheme: copy(),
    sectionThemes: { identity: copy(), professional: copy(), connections: copy() },
  };
}

type UseAddCardOptions = {
  cardId?: string;
  creationSession?: string;
};

export function useAddCard(options: UseAddCardOptions = {}) {
  const { profile } = useProfileSnapshot();
  const { enabled: logoThemesEnabled } = useLogoThemePreference();
  const { enabled: tagDesignEnabled } = useCardTagDesignPreference();
  const isEditMode = Boolean(options.cardId);
  const [draft, setDraft] = useState<BusinessCard>(() =>
    buildAddCardDraftForEditor(profile, options.cardId),
  );
  const initialSnapshot = useRef(JSON.stringify(draft));
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const hasChanges = JSON.stringify(draft) !== initialSnapshot.current;

  const setOverride = useCallback((field: CardSectionFieldId, value: string) => {
    setDraft((prev) => ({ ...prev, sectionOverrides: { ...prev.sectionOverrides, [field]: value } }));
  }, []);

  const applyCardTag = useCallback((tag: string) => {
    if (!isCardTag(tag)) {
      setOverride('cardTag', tag);
      return;
    }
    setDraft((prev) => {
      const hydrated = buildAddCardDraftFromCard(prev, profile);
      if (!tagDesignEnabled) {
        return { ...hydrated, sectionOverrides: { ...hydrated.sectionOverrides, cardTag: tag } };
      }
      const logoUrl = hydrated.sectionOverrides?.logo;
      const cachedPalette = logoUrl ? getCachedLogoPalette(logoUrl) : undefined;
      return applyCardTagDesign(hydrated, tag, { logoThemesEnabled, logoPalette: cachedPalette });
    });
  }, [logoThemesEnabled, profile, setOverride, tagDesignEnabled]);

  const applyLogoThemes = useCallback((palette: LogoPalette) => {
    if (!logoThemesEnabled) {
      if (!tagDesignEnabled) return;
      setDraft((prev) => {
        const currentTag = prev.sectionOverrides?.cardTag;
        const activeTag = currentTag && isCardTag(currentTag) ? currentTag : 'Business';
        const preset = getCardTagDesignPreset(activeTag);
        return withThemeEverywhere({
          ...prev,
          sectionLayouts: { ...preset.layouts },
          customThemes: (prev.customThemes ?? []).filter((item) => !item.id.startsWith('logo-tag-')),
        }, preset.theme);
      });
      return;
    }
    const dynamicTagThemes = buildDynamicTagThemes(palette);
    const savedCustomThemes: SavedSectionTheme[] = (
      Object.keys(dynamicTagThemes) as CardTag[]
    ).map((tagKey) => {
      const t = dynamicTagThemes[tagKey];
      return {
        id: `logo-tag-${tagKey.toLowerCase()}`,
        name: t.customThemeName || `Brand ${tagKey}`,
        gradient: [...t.gradient],
        paletteTier: 3,
        paletteColors: t.paletteColors ? [...t.paletteColors] : [t.gradient[0], t.surfaceColor, t.gradient[1]],
      };
    });

    setDraft((prev) => {
      const currentTag = prev.sectionOverrides?.cardTag;
      const activeTag = currentTag && isCardTag(currentTag) ? currentTag : 'Business';
      const activeDynamicTheme = dynamicTagThemes[activeTag] || dynamicTagThemes.Business;

      return withThemeEverywhere(
        {
          ...prev,
          customThemes: [
            ...savedCustomThemes,
            ...(prev.customThemes ?? []).filter((item) => !item.id.startsWith('logo-tag-')),
          ],
        },
        activeDynamicTheme,
      );
    });
  }, [logoThemesEnabled, tagDesignEnabled]);

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

  const saveFieldToAccount = useCallback(async (field: AccountScopedCardField, value: string) => {
    if (isUpdatingAccount) return false;
    setIsUpdatingAccount(true);
    try {
      const saved = await saveProfile(applyCardFieldToProfile(profileRef.current, field, value));
      profileRef.current = saved;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return true;
    } catch (error) {
      Alert.alert(
        'Account update failed',
        error instanceof Error ? error.message : 'This card still has the change, but the account default could not be updated.',
      );
      return false;
    } finally {
      setIsUpdatingAccount(false);
    }
  }, [isUpdatingAccount]);

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
          : resolveConnectionsLayoutId(layout);
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

  // The profile can load after the editor. Reapply account fallbacks until the user starts typing.
  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;
  useEffect(() => {
    if (!hasChangesRef.current) reset();
  }, [reset]);

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
    isUpdatingAccount,
    setOverride,
    applyCardTag,
    setTextField,
    saveFieldToAccount,
    setContactValue,
    addContact,
    removeContact,
    setLayout,
    setTheme,
    applyLogoThemes,
    saveCustomTheme,
    save,
    reset,
  };
}
