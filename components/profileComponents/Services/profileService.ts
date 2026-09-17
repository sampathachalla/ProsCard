// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredUser } from '../types/profile.types';

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem('userInfo');
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem('userInfo');
}
