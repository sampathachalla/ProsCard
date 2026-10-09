import { Platform } from 'react-native';
import { ApiError, apiRequest } from '@/services/api/client';
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
  const prefetch = import('expo-image')
    .then(({ Image }) => Image.prefetch(urls, 'memory-disk'))
    .catch(() => false);
  // Images are a nice-to-have: after a few seconds show the card anyway and let them stream in.
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([prefetch, new Promise((resolve) => { timer = setTimeout(resolve, MEDIA_PREFETCH_WAIT_MS); })]);
  clearTimeout(timer);
}

const MEDIA_PREFETCH_WAIT_MS = 4_000;
const SHARE_REQUEST_TIMEOUT_MS = 20_000;

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

  // AbortController + setTimeout rather than AbortSignal.timeout, which older mobile browsers lack.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHARE_REQUEST_TIMEOUT_MS);
  let view: SharedCardView;
  try {
    const response = await fetch(`${origin}/api/v1${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(response.status === 404 ? 'Shared card not found or expired.' : `Request failed (${response.status}).`, response.status, null);
    view = await response.json() as SharedCardView;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The card took too long to load. Check your connection and try again.');
    if (error instanceof SyntaxError) throw new Error('The card could not be loaded. Please try again.');
    if (error instanceof TypeError) throw new Error('Can’t reach ProsCard. Check your internet connection and try again.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
