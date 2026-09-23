import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Profile } from '../types/profile.types';
import { DEFAULT_PROFILE, getProfile, getStoredUser } from '../Services/profileService';

async function loadProfile(): Promise<Profile> {
  const [storedProfile, user] = await Promise.all([getProfile(), getStoredUser()]);
  return !storedProfile.fullName && user?.username
    ? { ...storedProfile, fullName: user.username }
    : storedProfile;
}

export function useProfileSnapshot() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
    }, []),
  );

  return { profile };
}
