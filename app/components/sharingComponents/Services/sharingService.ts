import { Platform } from 'react-native';
import { apiRequest } from '@/services/api/client';
import { API_BASE_URL } from '@/services/api/config';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';

/**
 * Where QR codes and share links point. The API serves the public share page, so by default this is
 * the API's own address; set EXPO_PUBLIC_WEB_URL once a dedicated domain exists.
 */
export const PUBLIC_WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || API_BASE_URL || 'http://localhost:8050').trim().replace(/\/$/, '');

type ShareRecord = { id: string; slug: string };
export type SharedCard = Pick<BusinessCard, 'id' | 'name'> & Partial<Pick<BusinessCard, 'title' | 'company' | 'phone' | 'email' | 'gradient'>>;

export function shareUrlForSlug(slug: string): string {
  return `${PUBLIC_WEB_URL}/share/${slug}`;
}

/** Extracts the share slug from a scanned QR payload (a ProsCard share URL). */
export function parseShareSlug(data: string): string | null {
  return data.trim().match(/\/share\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/)?.[1] ?? null;
}

/** Returns the card's public share URL, reusing its active share link on the backend. */
export async function getShareUrl(cardId: string): Promise<string> {
  if (AUTH_TEST_MODE) return `${PUBLIC_WEB_URL}/cards/${cardId}`;
  const share = await apiRequest<ShareRecord>(`/sharing/cards/${encodeURIComponent(cardId)}`, { method: 'POST', body: {} });
  return shareUrlForSlug(share.slug);
}

type SharedCardView = { card: BusinessCard; profile: Partial<Profile> };

const SHARED_MEDIA_PATH = /\/api\/v1\/sharing\/public\/[^/]+\/media\/[^/?#]+/;

function collectSharedMediaUrls(value: unknown, urls = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    if (SHARED_MEDIA_PATH.test(value)) {
      const absolute = /^(?:https?:)?\/\//i.test(value)
        ? value
        : `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
      urls.add(absolute);
    }
    return urls;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectSharedMediaUrls(item, urls));
    return urls;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectSharedMediaUrls(item, urls));
  }
  return urls;
}

async function prefetchSharedMedia(view: SharedCardView): Promise<void> {
  const urls = [...collectSharedMediaUrls(view)];
  if (!urls.length) return;
  // Public media URLs authorize and redirect to OCI. Warming the exact URLs here
  // prevents text from painting a full network round trip before photos and logos.
  await import('expo-image')
    .then(({ Image }) => Image.prefetch(urls, 'memory-disk'))
    .catch(() => false);
}

/**
 * Card plus owner profile for the public share page; image links are already share-scoped.
 * On the web the page is served by the API itself, so it talks to (and loads images from) the origin
 * it was opened on — whatever domain the QR code used — rather than the address baked into the build.
 */
export async function getSharedCardView(slug: string): Promise<SharedCardView> {
  const path = `/sharing/public/${encodeURIComponent(slug)}/view`;
  const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : null;
  if (!origin) {
    const view = await apiRequest<SharedCardView>(path, { authenticated: false });
    await prefetchSharedMedia(view);
    return view;
  }

  const response = await fetch(`${origin}/api/v1${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error(response.status === 404 ? 'Shared card not found or expired.' : `Request failed (${response.status}).`);
  const view = await response.json() as SharedCardView;
  // Absolute same-origin image links, so they are not re-pointed at the build's API address.
  const absolute = JSON.parse(
    JSON.stringify(view).replace(/"\/api\/v1\/sharing\/public\//g, `"${origin}/api/v1/sharing/public/`),
  ) as SharedCardView;
  await prefetchSharedMedia(absolute);
  return absolute;
}

export async function resolveSharedCard(slug: string): Promise<SharedCard> {
  return apiRequest<SharedCard>(`/sharing/public/${encodeURIComponent(slug)}?t=${Date.now()}`, { authenticated: false });
}
