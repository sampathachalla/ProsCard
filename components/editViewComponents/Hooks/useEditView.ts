// components/editViewComponents/Hooks/useEditView.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import type { CardFieldKey, EditableCard } from '../types/editView.types';
import { getEditableCard, saveCard } from '../Services/editViewService';
import { validateCard } from '../Utils/validateCard';

export function useEditView(cardId?: string, startInEditMode = false) {
  const [card, setCard] = useState<EditableCard>(() => getEditableCard(cardId));
  const [draft, setDraft] = useState<EditableCard>(() => getEditableCard(cardId));
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setDraft(card);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(card);
    setIsEditing(false);
  };

  const updateField = (field: CardFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
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

  return { card, draft, isEditing, isSaving, startEditing, cancelEditing, updateField, submit };
}
