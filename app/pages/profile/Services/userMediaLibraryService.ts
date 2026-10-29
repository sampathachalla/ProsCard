import { ApiError } from '@/services/api/client';
import { apiRequest } from '@/services/api/client';
import { getCards } from '@/pages/cards/Services/cardsService';
import type { ProfileMediaKind, UserMediaLibraryItem } from '@/services/api/types';
import { getProfile } from './profileService';
import { mediaIdFromContentUrl } from './pendingMedia';

export async function fetchUserMediaLibrary(kind?: ProfileMediaKind): Promise<UserMediaLibraryItem[]> {
  const query = kind ? `?kind=${encodeURIComponent(kind)}` : '';
  try {
    const response = await apiRequest<{ items: UserMediaLibraryItem[] }>(`/media/library${query}`);
    return response.items ?? [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return await buildUserMediaLibraryFromLocalState();
    }
    throw error;
  }
}

async function buildUserMediaLibraryFromLocalState(): Promise<UserMediaLibraryItem[]> {
  const profile = await getProfile();
  const cards = getCards();
  const activeUrls = new Set<string>();

  const trackActive = (url: string | undefined) => {
    if (url?.trim()) activeUrls.add(url.trim());
  };

  trackActive(profile.photoUrl);
  trackActive(profile.coverPhotoUrl);
  trackActive(profile.companyLogoUrl);

  for (const card of cards) {
    const overrides = card.sectionOverrides ?? {};
    trackActive(overrides.profilePhoto);
    trackActive(overrides.coverPhoto);
    trackActive(overrides.logo);
  }

  const byMediaId = new Map<string, UserMediaLibraryItem>();

  const addUrl = (url: string | undefined, kind: ProfileMediaKind) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    const mediaId = mediaIdFromContentUrl(trimmed);
    if (!mediaId) return;
    const existing = byMediaId.get(mediaId);
    if (existing) {
      if (activeUrls.has(trimmed)) existing.inUse = true;
      return;
    }
    byMediaId.set(mediaId, {
      mediaId,
      kind,
      contentUrl: trimmed,
      originalName: kind,
      createdAt: new Date(0).toISOString(),
      inUse: activeUrls.has(trimmed),
    });
  };

  addUrl(profile.coverPhotoUrl, 'coverPhoto');
  addUrl(profile.photoUrl, 'profilePhoto');
  addUrl(profile.companyLogoUrl, 'companyLogo');

  for (const card of cards) {
    const overrides = card.sectionOverrides ?? {};
    addUrl(overrides.coverPhoto, 'coverPhoto');
    addUrl(overrides.profilePhoto, 'profilePhoto');
    addUrl(overrides.logo, 'companyLogo');
  }

  return [...byMediaId.values()];
}

export { groupUserMediaByKind } from '../Utils/userMediaLibraryUtils';
