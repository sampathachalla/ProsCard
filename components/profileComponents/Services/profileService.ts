// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, StoredUser } from '../types/profile.types';

const PROFILE_STORAGE_KEY = 'userProfile';

export const DEFAULT_PROFILE: Profile = {
  prefix: '',
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  preferredName: '',
  accreditations: '',
  fullName: '',
  title: '',
  department: '',
  organization: '',
  companyLogoUrl: '',
  coverPhotoUrl: '',
  email: '',
  phone: '',
  photoUrl: '',
  website: '',
  social: {
    linkedin: '',
    x: '',
    instagram: '',
    facebook: '',
    github: '',
    portfolio: '',
    whatsapp: '',
    youtube: '',
    tiktok: '',
  },
  tagline: '',
  businessAddress: '',
  shortBio: '',
};

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem('userInfo');
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem('userInfo');
}

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  const parsed = JSON.parse(raw) as Partial<Profile>;
  const legacyNameParts = (parsed.fullName ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    ...DEFAULT_PROFILE,
    ...parsed,
    firstName: parsed.firstName || legacyNameParts[0] || '',
    lastName: parsed.lastName || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : ''),
    social: {
      ...DEFAULT_PROFILE.social,
      ...(parsed.social ?? {}),
    },
  };
}

export function saveProfile(profile: Profile): Promise<Profile> {
  // Placeholder until a real profile backend exists.
  return AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)).then(() => profile);
}
