import { apiRequest } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';

export const PUBLIC_WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://proscard.app').trim().replace(/\/$/, '');

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

export async function resolveSharedCard(slug: string): Promise<SharedCard> {
  return apiRequest<SharedCard>(`/sharing/public/${encodeURIComponent(slug)}`, { authenticated: false });
}
