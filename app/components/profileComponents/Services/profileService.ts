// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, StoredUser } from '../types/profile.types';
import { apiRequest, ApiError } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { logout } from '@/components/authComponents/Services/authService';

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
  await logout();
}

export async function getProfile(): Promise<Profile> {
  if (!AUTH_TEST_MODE) {
    try {
      const remote = await apiRequest<Profile>('/profiles/me');
      const normalized = normalizeProfile(remote);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
      return DEFAULT_PROFILE;
    }
  }
  const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  return normalizeProfile(JSON.parse(raw) as Partial<Profile>);
}

function normalizeProfile(parsed: Partial<Profile>): Profile {
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

export async function saveProfile(profile: Profile): Promise<Profile> {
  const { userId: _userId, updatedAt: _updatedAt, ...payload } = profile;
  const saved = AUTH_TEST_MODE
    ? normalizeProfile(profile)
    : normalizeProfile(await apiRequest<Profile>('/profiles/me', { method: 'PUT', body: payload }));
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(saved));
  listeners.forEach((listener) => listener(saved));
  return saved;
}
