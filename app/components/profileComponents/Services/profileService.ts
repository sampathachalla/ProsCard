// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, StoredUser } from '../types/profile.types';

const PROFILE_STORAGE_KEY = 'userProfile';

/** Blank slate for a user who hasn't filled in a profile yet — every field
 * starts empty so the UI shows real empty/placeholder states instead of a
 * stranger's seeded identity. */
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
    firstName: parsed.firstName || legacyNameParts[0] || DEFAULT_PROFILE.firstName,
    lastName: parsed.lastName || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : DEFAULT_PROFILE.lastName),
    social: {
      ...DEFAULT_PROFILE.social,
      ...(parsed.social ?? {}),
    },
  };
}

type ProfileListener = (profile: Profile) => void;
const listeners = new Set<ProfileListener>();

export function subscribeProfile(listener: ProfileListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveProfile(profile: Profile): Promise<Profile> {
  return AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)).then(() => {
    listeners.forEach((listener) => listener(profile));
    return profile;
  });
}
