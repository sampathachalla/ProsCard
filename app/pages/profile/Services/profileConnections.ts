import type { BusinessCard, DynamicCardField } from '@/pages/cards/types/card.types';
import type { Profile, SocialFieldKey } from '../types/profile.types';

export const MINIMUM_CARD_CONNECTION_FIELDS = 5;

const SOCIAL_TITLES: Record<string, SocialFieldKey> = {
  linkedin: 'linkedin',
  x: 'x',
  twitter: 'x',
  xtwitter: 'x',
  github: 'github',
  portfolio: 'portfolio',
  instagram: 'instagram',
  facebook: 'facebook',
  whatsapp: 'whatsapp',
  youtube: 'youtube',
  tiktok: 'tiktok',
};

function normalizedTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function connectionProfileKey(
  field: Pick<DynamicCardField, 'id' | 'title'>,
): 'email' | 'phone' | 'website' | 'businessAddress' | SocialFieldKey | undefined {
  const key = normalizedTitle(field.title) || normalizedTitle(field.id);
  if (key === 'email') return 'email';
  if (key === 'phone' || key === 'phonenumber') return 'phone';
  if (key === 'website' || key === 'web') return 'website';
  if (key === 'address' || key === 'businessaddress') return 'businessAddress';
  return socialKeyForConnection(field);
}

export function socialKeyForConnection(field: Pick<DynamicCardField, 'id' | 'title'>): SocialFieldKey | undefined {
  return SOCIAL_TITLES[normalizedTitle(field.title)] ?? SOCIAL_TITLES[normalizedTitle(field.id)];
}

export function profileValueForConnection(
  profile: Profile,
  field: Pick<DynamicCardField, 'id' | 'title'>,
): string {
  const key = normalizedTitle(field.title) || normalizedTitle(field.id);
  if (key === 'email') return profile.email;
  if (key === 'phone' || key === 'phonenumber') return profile.phone;
  if (key === 'website' || key === 'web') return profile.website;
  if (key === 'address' || key === 'businessaddress') return profile.businessAddress;
  const socialKey = socialKeyForConnection(field);
  return socialKey ? (profile.social[socialKey] ?? '') : '';
}

/** Profile first, then another saved card. This also migrates values created before profile syncing. */
export function reusableConnectionValue(
  profile: Profile,
  cards: BusinessCard[],
  currentCardId: string | undefined,
  field: Pick<DynamicCardField, 'id' | 'title'>,
): string {
  const profileValue = profileValueForConnection(profile, field).trim();
  if (profileValue) return profileValue;
  const profileKey = connectionProfileKey(field);
  if (!profileKey) return '';

  for (const card of cards) {
    if (card.id === currentCardId) continue;
    const match = card.connectionFields.find(
      (candidate) => connectionProfileKey(candidate) === profileKey && candidate.value.trim(),
    );
    if (match) return match.value.trim();
    if (profileKey === 'email' && card.email.trim()) return card.email.trim();
    if (profileKey === 'phone' && card.phone.trim()) return card.phone.trim();
  }
  return '';
}

export function connectionCounts(fields: DynamicCardField[]): {
  total: number;
  social: number;
} {
  const populated = fields.filter((field) => field.value.trim());
  return {
    total: populated.length,
    social: populated.filter((field) => Boolean(socialKeyForConnection(field))).length,
  };
}

/** Copies recognized card contact values into the account profile for reuse by every card. */
export function profileWithConnectionFields(profile: Profile, fields: DynamicCardField[]): Profile {
  const next: Profile = { ...profile, social: { ...profile.social } };
  for (const field of fields) {
    const value = field.value.trim();
    if (!value) continue;
    const key = normalizedTitle(field.title) || normalizedTitle(field.id);
    if (key === 'email') next.email = value;
    else if (key === 'phone' || key === 'phonenumber') next.phone = value;
    else if (key === 'website' || key === 'web') next.website = value;
    else if (key === 'address' || key === 'businessaddress') next.businessAddress = value;
    else {
      const socialKey = socialKeyForConnection(field);
      if (socialKey) next.social[socialKey] = value;
    }
  }
  return next;
}

export function profileConnectionsChanged(current: Profile, next: Profile): boolean {
  return (
    current.email !== next.email ||
    current.phone !== next.phone ||
    current.website !== next.website ||
    current.businessAddress !== next.businessAddress ||
    JSON.stringify(current.social) !== JSON.stringify(next.social)
  );
}
