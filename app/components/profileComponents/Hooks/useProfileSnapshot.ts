import { useEffect, useState } from 'react';
import type { Profile } from '../types/profile.types';
import { DEFAULT_PROFILE, getProfile, getStoredUser, subscribeProfile } from '../Services/profileService';

async function loadProfile(): Promise<Profile> {
  const [storedProfile, user] = await Promise.all([getProfile(), getStoredUser()]);
  return !storedProfile.fullName && user?.username
    ? { ...storedProfile, fullName: user.username }
    : storedProfile;
}

export function useProfileSnapshot() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch((reason) => setError(reason instanceof Error ? reason : new Error('Could not load profile.')))
      .finally(() => setLoading(false));
    const unsubscribe = subscribeProfile((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  return { profile, loading, error, refresh: loadProfile };
}
