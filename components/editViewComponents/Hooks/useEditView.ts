// components/editViewComponents/Hooks/useEditView.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import type { CardFieldKey, EditableCard } from '../types/editView.types';
import type { CardSectionFieldId, CardSectionId, CardTemplateId, CardVisualTheme, DynamicCardField, SavedSectionTheme } from '@/components/cardsComponents/types/card.types';
import { themeFromSavedSectionTheme } from '@/utils/cardThemeColor';
import { getEditableCard, saveCard } from '../Services/editViewService';
import { validateCard } from '../Utils/validateCard';

const SECTION_FIELD_IDS: Record<Exclude<CardSectionId, 'connections'>, CardSectionFieldId[]> = {
  identity: ['preferredName', 'coverPhoto', 'profilePhoto', 'logo'],
  professional: ['tagline', 'accreditations', 'prefix', 'suffix', 'firstName', 'middleName', 'lastName', 'title', 'company'],
  bio: ['bio'],
};

export function useEditView(cardId?: string, startInEditMode = false) {
  const [card, setCard] = useState<EditableCard>(() => getEditableCard(cardId));
  const [draft, setDraft] = useState<EditableCard>(() => getEditableCard(cardId));
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(card);
  const hasSectionChanges = (section: CardSectionId) => {
    const commonChanged =
      draft.sectionLayouts[section] !== card.sectionLayouts[section] ||
      JSON.stringify(draft.sectionThemes[section]) !== JSON.stringify(card.sectionThemes[section]) ||
      JSON.stringify(draft.customThemes ?? []) !== JSON.stringify(card.customThemes ?? []);
    if (section === 'connections') {
      return commonChanged ||
        draft.connectionFieldsCustomized !== card.connectionFieldsCustomized ||
        JSON.stringify(draft.connectionFields) !== JSON.stringify(card.connectionFields);
    }

    const fieldsChanged = SECTION_FIELD_IDS[section].some(
      (field) => draft.sectionOverrides[field] !== card.sectionOverrides[field],
    );
    if (section === 'identity') return commonChanged || fieldsChanged || draft.name !== card.name;
    if (section === 'professional') return commonChanged || fieldsChanged || draft.title !== card.title || draft.company !== card.company;
    return commonChanged || fieldsChanged;
  };

  const startEditing = () => {
    if (!hasChanges) {
      setDraft({
        ...card,
        cardTheme: { ...card.cardTheme, gradient: [...card.cardTheme.gradient] },
        sectionThemes: Object.fromEntries(Object.entries(card.sectionThemes).map(([section, theme]) => [section, { ...theme, gradient: [...theme.gradient] }])) as EditableCard['sectionThemes'],
        sectionLayouts: { ...card.sectionLayouts },
        sectionOverrides: { ...card.sectionOverrides },
        connectionFields: card.connectionFields.map((field) => ({ ...field })),
        customThemes: (card.customThemes ?? []).map((item) => ({ ...item, gradient: [item.gradient[0], item.gradient[1]] as [string, string] })),
      });
    }
    setIsEditing(true);
  };

  const stopEditing = () => setIsEditing(false);

  const cancelEditing = () => {
    setDraft({
      ...card,
      cardTheme: { ...card.cardTheme, gradient: [...card.cardTheme.gradient] },
      sectionThemes: Object.fromEntries(Object.entries(card.sectionThemes).map(([section, theme]) => [section, { ...theme, gradient: [...theme.gradient] }])) as EditableCard['sectionThemes'],
      sectionLayouts: { ...card.sectionLayouts },
      sectionOverrides: { ...card.sectionOverrides },
      connectionFields: card.connectionFields.map((field) => ({ ...field })),
      customThemes: (card.customThemes ?? []).map((item) => ({ ...item, gradient: [item.gradient[0], item.gradient[1]] as [string, string] })),
    });
    setIsEditing(false);
  };

  const updateField = (field: CardFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateSectionLayout = (section: CardSectionId, template: CardTemplateId) => {
    setDraft((prev) => ({ ...prev, sectionLayouts: { ...prev.sectionLayouts, [section]: template } }));
  };

  const updateSectionField = (field: CardSectionFieldId, value: string) => {
    setDraft((prev) => ({
      ...prev,
      ...(field === 'preferredName' ? { name: value } : {}),
      ...(field === 'title' ? { title: value } : {}),
      ...(field === 'company' ? { company: value } : {}),
      sectionOverrides: { ...prev.sectionOverrides, [field]: value },
    }));
  };

  const replaceConnectionFields = (fields: DynamicCardField[]) => {
    setDraft((prev) => ({ ...prev, connectionFields: fields, connectionFieldsCustomized: true }));
  };

  const updateSectionTheme = (section: CardSectionId, theme: CardVisualTheme) => {
    setDraft((prev) => ({
      ...prev,
      sectionThemes: { ...prev.sectionThemes, [section]: { ...theme, gradient: [...theme.gradient] } },
    }));
  };

  const resetSection = (section: CardSectionId) => {
    setDraft((current) => {
      const sectionOverrides = { ...current.sectionOverrides };
      if (section !== 'connections') {
        SECTION_FIELD_IDS[section].forEach((field) => {
          const savedValue = card.sectionOverrides[field];
          if (savedValue === undefined) delete sectionOverrides[field];
          else sectionOverrides[field] = savedValue;
        });
      }

      return {
        ...current,
        ...(section === 'identity' ? { name: card.name } : {}),
        ...(section === 'professional' ? { title: card.title, company: card.company } : {}),
        sectionLayouts: { ...current.sectionLayouts, [section]: card.sectionLayouts[section] },
        sectionThemes: {
          ...current.sectionThemes,
          [section]: {
            ...card.sectionThemes[section],
            gradient: [...card.sectionThemes[section].gradient],
          },
        },
        sectionOverrides,
        connectionFields:
          section === 'connections'
            ? card.connectionFields.map((field) => ({ ...field }))
            : current.connectionFields,
        connectionFieldsCustomized:
          section === 'connections'
            ? card.connectionFieldsCustomized
            : current.connectionFieldsCustomized,
        customThemes: (card.customThemes ?? []).map((item) => ({
          ...item,
          gradient: [item.gradient[0], item.gradient[1]] as [string, string],
        })),
      };
    });
  };

  const saveCustomSectionTheme = (section: CardSectionId, entry: SavedSectionTheme) => {
    setDraft((prev) => {
      const withoutDuplicate = (prev.customThemes ?? []).filter((item) => item.id !== entry.id);
      return {
        ...prev,
        customThemes: [entry, ...withoutDuplicate],
        sectionThemes: {
          ...prev.sectionThemes,
          [section]: themeFromSavedSectionTheme(entry, prev.sectionThemes[section].fontStyle),
        },
      };
    });
  };

  const submit = async () => {
    const error = validateCard(draft);
    if (error) {
      Alert.alert('Check your details', error);
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveCard(draft);
      setCard(saved);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const submitSection = async (section: CardSectionId) => {
    const sectionOverrides = { ...card.sectionOverrides };
    if (section !== 'connections') {
      SECTION_FIELD_IDS[section].forEach((field) => {
        const value = draft.sectionOverrides[field];
        if (value === undefined) delete sectionOverrides[field];
        else sectionOverrides[field] = value;
      });
    }

    const candidate: EditableCard = {
      ...card,
      ...(section === 'identity' ? { name: draft.name } : {}),
      ...(section === 'professional' ? { title: draft.title, company: draft.company } : {}),
      sectionThemes: {
        ...card.sectionThemes,
        [section]: { ...draft.sectionThemes[section], gradient: [...draft.sectionThemes[section].gradient] },
      },
      sectionLayouts: { ...card.sectionLayouts, [section]: draft.sectionLayouts[section] },
      sectionOverrides,
      connectionFields: section === 'connections' ? draft.connectionFields.map((field) => ({ ...field })) : card.connectionFields.map((field) => ({ ...field })),
      connectionFieldsCustomized: section === 'connections' ? draft.connectionFieldsCustomized : card.connectionFieldsCustomized,
      customThemes: (draft.customThemes ?? []).map((item) => ({
        ...item,
        gradient: [item.gradient[0], item.gradient[1]] as [string, string],
      })),
    };

    const error = validateCard(candidate);
    if (error) {
      Alert.alert('Check your details', error);
      return false;
    }

    setIsSaving(true);
    try {
      const saved = await saveCard(candidate);
      setCard(saved);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    card,
    draft,
    hasChanges,
    hasSectionChanges,
    isEditing,
    isSaving,
    startEditing,
    stopEditing,
    cancelEditing,
    updateField,
    updateSectionLayout,
    updateSectionField,
    replaceConnectionFields,
    resetSection,
    updateSectionTheme,
    saveCustomSectionTheme,
    submit,
    submitSection,
  };
}
