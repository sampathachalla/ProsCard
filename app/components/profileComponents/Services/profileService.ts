// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, StoredUser } from '../types/profile.types';
import { apiRequest, ApiError } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { logout } from '@/components/authComponents/Services/authService';
import { commitPendingMedia, mediaIdFromContentUrl } from './pendingMedia';
import { deleteMedia, prefetchMedia } from './mediaService';
import { getSession } from '@/services/api/session';
import { parseStoredJson } from '@/utils/safeJson';

const PROFILE_STORAGE_KEY = 'userProfile';
let lastProfileSyncFailed = false;
export const profileIsOffline = () => lastProfileSyncFailed;
async function profileStorageKey() {
  const session = await getSession();
  return session?.user.id ? `${PROFILE_STORAGE_KEY}:${session.user.id}` : PROFILE_STORAGE_KEY;
}

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
  return parseStoredJson<StoredUser>(await AsyncStorage.getItem('userInfo'));
}

export async function logoutUser(): Promise<void> {
  await logout();
}

export async function getProfile(): Promise<Profile> {
  const storageKey = await profileStorageKey();
  if (!AUTH_TEST_MODE) {
    try {
      const remote = await apiRequest<Profile>('/profiles/me');
      lastProfileSyncFailed = false;
      const normalized = normalizeProfile(remote);
      await AsyncStorage.setItem(storageKey, JSON.stringify(normalized));
      prefetchMedia([normalized.photoUrl, normalized.coverPhotoUrl, normalized.companyLogoUrl]);
      return normalized;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return DEFAULT_PROFILE;
      const cached = parseStoredJson<Partial<Profile>>(await AsyncStorage.getItem(storageKey));
      if (cached) {
        lastProfileSyncFailed = true;
        const normalized = normalizeProfile(cached);
        prefetchMedia([normalized.photoUrl, normalized.coverPhotoUrl, normalized.companyLogoUrl]);
        return normalized;
      }
      throw error;
    }
  }
  const stored = parseStoredJson<Partial<Profile>>(await AsyncStorage.getItem(storageKey));
  return stored ? normalizeProfile(stored) : DEFAULT_PROFILE;
}

/** Drops null/undefined entries so a field the backend left empty keeps its default instead of becoming null. */
function withoutMissing<T extends object>(value: T | null | undefined): Partial<T> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined)) as Partial<T>;
}

export function normalizeProfile(raw: Partial<Profile>): Profile {
  const parsed = withoutMissing(raw);
  const legacyNameParts = (typeof parsed.fullName === 'string' ? parsed.fullName : '').trim().split(/\s+/).filter(Boolean);
  return {
    ...DEFAULT_PROFILE,
    ...parsed,
    firstName: parsed.firstName || legacyNameParts[0] || DEFAULT_PROFILE.firstName,
    lastName: parsed.lastName || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : DEFAULT_PROFILE.lastName),
    social: {
      ...DEFAULT_PROFILE.social,
      ...withoutMissing(parsed.social),
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
  let prepared = profile;
  if (!AUTH_TEST_MODE) {
    const current = await getProfile().catch(() => DEFAULT_PROFILE);
    const [photoUrl, coverPhotoUrl, companyLogoUrl] = await Promise.all([
      commitPendingMedia(profile.photoUrl, 'profilePhoto'),
      commitPendingMedia(profile.coverPhotoUrl, 'coverPhoto'),
      commitPendingMedia(profile.companyLogoUrl, 'companyLogo'),
    ]);
    prepared = { ...profile, photoUrl, coverPhotoUrl, companyLogoUrl };
    const removals = [
      !profile.photoUrl && mediaIdFromContentUrl(current.photoUrl),
      !profile.coverPhotoUrl && mediaIdFromContentUrl(current.coverPhotoUrl),
      !profile.companyLogoUrl && mediaIdFromContentUrl(current.companyLogoUrl),
    ].filter((id): id is string => Boolean(id));
    await Promise.all(removals.map(deleteMedia));
  }
  const { userId: _userId, updatedAt: _updatedAt, ...payload } = prepared;
  const saved = AUTH_TEST_MODE
    ? normalizeProfile(prepared)
    : normalizeProfile(await apiRequest<Profile>('/profiles/me', { method: 'PUT', body: payload }));
  await AsyncStorage.setItem(await profileStorageKey(), JSON.stringify(saved));
  prefetchMedia([saved.photoUrl, saved.coverPhotoUrl, saved.companyLogoUrl]);
  listeners.forEach((listener) => listener(saved));
  return saved;
}
