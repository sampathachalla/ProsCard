import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '../types/profile.types';
import { DEFAULT_PROFILE, getProfile, getStoredUser, saveProfile } from '../Services/profileService';
import { validateProfile } from '../Utils/validateProfile';

export function useProfileEditor() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [storedProfile, user] = await Promise.all([getProfile(), getStoredUser()]);
      const seeded =
        !storedProfile.fullName && user?.username
          ? { ...storedProfile, fullName: user.username }
          : storedProfile;

      if (!cancelled) {
        setProfile(seeded);
        setDraft(seeded);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const updateField = (field: ProfileFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: SocialFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, social: { ...prev.social, [field]: value } }));
  };

  const submit = async () => {
    const fullName = [draft.prefix, draft.firstName, draft.middleName, draft.lastName, draft.suffix]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ') || draft.fullName.trim();
    const normalizedDraft = { ...draft, fullName };
    const error = validateProfile(normalizedDraft);
    if (error) {
      Alert.alert('Check your details', error);
      return false;
    }
    setIsSaving(true);
    try {
      const saved = await saveProfile(normalizedDraft);
      setProfile(saved);
      setIsEditing(false);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    draft,
    isEditing,
    isSaving,
    loading,
    startEditing,
    cancelEditing,
    updateField,
    updateSocial,
    submit,
  };
}
