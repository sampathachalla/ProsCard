// components/profileComponents/Hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import type { StoredUser } from '../types/profile.types';
import { getStoredUser, logoutUser } from '../Services/profileService';

export function useProfile() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    getStoredUser().then(setUser);
  }, []);

  const logout = async () => {
    await logoutUser();
    router.replace('/auth/login');
  };

  return { user, logout };
}
