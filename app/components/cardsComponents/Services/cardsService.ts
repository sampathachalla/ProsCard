// components/cardsComponents/Services/cardsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { buildCustomSectionTheme } from '@/utils/cardThemeColor';
import { CARD_THEME_PRESETS, createDefaultCardSectionThemes, DEFAULT_CARD_SECTION_LAYOUTS, DEFAULT_CARD_THEME, resolveIdentityLayoutId, type BusinessCard, type CardVisualTheme } from '../types/card.types';
import { apiRequest } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { commitPendingMedia, isPendingMediaUrl, mediaIdFromContentUrl } from '@/components/profileComponents/Services/pendingMedia';
import { deleteMedia, prefetchMedia } from '@/components/profileComponents/Services/mediaService';
import { getSession } from '@/services/api/session';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import type { Profile } from '@/components/profileComponents/types/profile.types';

const PRIMARY_CARD_KEY = 'primaryCard';
const USER_CARDS_KEY = 'userCards';
let lastCardsSyncFailed = false;
export const cardsAreOffline = () => lastCardsSyncFailed;
async function scopedCardKey(key: string) {
  const session = await getSession();
  return session?.user.id ? `${key}:${session.user.id}` : key;
}

function isGradient(value: unknown): value is [string, string] {
  return Array.isArray(value) && typeof value[0] === 'string' && typeof value[1] === 'string';
}

function themeForGradient(input: [string, string] | undefined): CardVisualTheme {
  // Cards from older builds or the server can lack a valid gradient; fall back to the default colors.
  const gradient: [string, string] = isGradient(input) ? input : DEFAULT_CARD_THEME.gradient;
  const preset = Object.values(CARD_THEME_PRESETS).find(
    (item) =>
      item.gradient[0].toLowerCase() === gradient[0].toLowerCase() &&
      item.gradient[1].toLowerCase() === gradient[1].toLowerCase(),
  );
  if (preset) {
    return { ...preset, gradient: [gradient[0], gradient[1]], fontStyle: 'modern' };
  }
  return buildCustomSectionTheme(gradient, 'modern');
}

function defaultSectionData(gradient: [string, string] = DEFAULT_CARD_THEME.gradient) {
  const cardTheme = themeForGradient(gradient);
  return {
    sectionLayouts: { ...DEFAULT_CARD_SECTION_LAYOUTS },
    sectionOverrides: {},
    connectionFields: [],
    connectionFieldsCustomized: false,
    cardTheme,
    sectionThemes: createDefaultCardSectionThemes(cardTheme),
  };
}

export function normalizeCard(card: BusinessCard | (Omit<BusinessCard, 'sectionLayouts' | 'sectionThemes' | 'sectionOverrides' | 'connectionFields' | 'connectionFieldsCustomized' | 'cardTheme'> & Partial<Pick<BusinessCard, 'sectionLayouts' | 'sectionThemes' | 'sectionOverrides' | 'connectionFields' | 'connectionFieldsCustomized' | 'cardTheme'>>)): BusinessCard {
  const cardTheme = card.cardTheme ? { ...DEFAULT_CARD_THEME, ...card.cardTheme, gradient: card.cardTheme.gradient ?? card.gradient } : themeForGradient(card.gradient);
  const defaultThemes = createDefaultCardSectionThemes(cardTheme);
  return {
    ...card,
    isPrimary: card.isPrimary ?? false,
    sectionLayouts: {
      ...DEFAULT_CARD_SECTION_LAYOUTS,
      ...(card.sectionLayouts ?? {}),
      // Older cards saved the identity style name ('minimal'); convert it to its layout id.
      identity: resolveIdentityLayoutId(card.sectionLayouts?.identity),
    },
    sectionOverrides: { ...(card.sectionOverrides ?? {}) },
    connectionFields: Array.isArray(card.connectionFields) ? card.connectionFields : [],
    connectionFieldsCustomized: card.connectionFieldsCustomized ?? false,
    cardTheme,
    sectionThemes: Object.fromEntries(
      Object.entries(defaultThemes).map(([section, theme]) => {
        const savedTheme = card.sectionThemes?.[section as keyof typeof defaultThemes];
        // Incomplete saved themes (missing colors) keep the default colors rather than crashing.
        return [section, savedTheme ? { ...theme, ...savedTheme, gradient: isGradient(savedTheme.gradient) ? [...savedTheme.gradient] : theme.gradient } : theme];
      }),
    ) as BusinessCard['sectionThemes'],
    customThemes: (Array.isArray(card.customThemes) ? card.customThemes : [])
      .filter((item) => item && isGradient(item.gradient))
      .map((item) => ({
        ...item,
        gradient: [item.gradient[0], item.gradient[1]] as [string, string],
      })),
  };
}

export const CARDS: BusinessCard[] = AUTH_TEST_MODE ? [
  {
    id: '1',
    isPrimary: true,
    category: 'Professional',
    name: 'Dr. Sampath Kumar Achalla PhD',
    title: 'FDE',
    company: 'MindPros Technologies',
    phone: '+1 (555) 010-2030',
    email: 'sampath@proscard.app',
    gradient: [Colors.light.tint, Colors.palette.brandCyan],
    ...defaultSectionData([Colors.light.tint, Colors.palette.brandCyan]),
    sectionLayouts: {
      identity: 'classic',
      professional: 'classic',
      bio: 'classic',
      connections: 'classic',
    },
    sectionOverrides: {
      preferredName: 'Dr. Sampath Achalla',
      title: 'FDE',
      company: 'MindPros Technologies',
      tagline: 'Building next-generation digital networking tools for visionary professionals.',
      accreditations: 'MBA, AWS Certified Architect, PMP',
      prefix: 'Dr.',
      firstName: 'Sampath',
      middleName: 'Kumar',
      lastName: 'Achalla',
      suffix: 'PhD',
      bio: 'Product architect dedicated to crafting high-impact digital experiences that empower creators, executives, and organizations to connect and build meaningful relationships globally.',
    },
  },
  {
    id: '2',
    category: 'Personal',
    name: 'Sampath Achalla',
    title: 'Product Designer',
    company: 'MindPros Studio',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.studio',
    gradient: [Colors.palette.surfaceDark, Colors.palette.midnightBase],
    ...defaultSectionData([Colors.palette.surfaceDark, Colors.palette.midnightBase]),
    sectionLayouts: {
      identity: 'minimal',
      professional: 'minimal',
      bio: 'minimal',
      connections: 'minimal',
    },
    sectionOverrides: {
      preferredName: 'Sampath K.',
      title: 'Lead Product & UX Designer',
      company: 'MindPros Studio',
      tagline: 'Designing intuitive interfaces and delightful user-centric mobile products.',
      accreditations: 'Nielsen Norman Certified, Figma Pro',
      prefix: '',
      firstName: 'Sampath',
      middleName: '',
      lastName: 'Achalla',
      suffix: '',
      bio: 'Specializing in design systems, micro-interactions, and mobile UX. Passionate about minimalism, typography, and human-computer interaction.',
    },
  },
  {
    id: '3',
    category: 'Business',
    name: 'Sampath Achalla',
    title: 'Full Stack Engineer',
    company: 'MindPros AI',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.ai',
    gradient: ['#4f46e5', '#7c3aed'],
    ...defaultSectionData(['#4f46e5', '#7c3aed']),
    sectionLayouts: {
      identity: 'bold',
      professional: 'bold',
      bio: 'bold',
      connections: 'bold',
    },
    sectionOverrides: {
      preferredName: 'Sampath Achalla',
      title: 'Principal AI & Full Stack Engineer',
      company: 'MindPros AI Labs',
      tagline: 'Scaling distributed intelligence and realtime agentic workflows.',
      accreditations: 'M.S. Computer Science, GCP Professional Cloud Architect',
      prefix: 'Eng.',
      firstName: 'Sampath',
      middleName: 'K.',
      lastName: 'Achalla',
      suffix: 'M.S.',
      bio: 'Deep expertise in React Native, TypeScript, cloud microservices, and neural search systems. Building scalable, resilient platforms for millions of users.',
    },
  },
  {
    id: '4',
    category: 'Networking',
    name: 'Sampath Achalla',
    title: 'Angel Investor',
    company: 'MindPros Ventures',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.vc',
    gradient: ['#0f766e', '#059669'],
    ...defaultSectionData(['#0f766e', '#059669']),
    sectionLayouts: {
      identity: 'glass',
      professional: 'glass',
      bio: 'glass',
      connections: 'glass',
    },
    sectionOverrides: {
      preferredName: 'Sampath Achalla',
      title: 'General Partner & Angel Investor',
      company: 'MindPros Ventures',
      tagline: 'Backing early-stage founders shaping the future of AI and developer tools.',
      accreditations: 'Kauffman Fellow, YC Alum',
      prefix: '',
      firstName: 'Sampath',
      middleName: '',
      lastName: 'Achalla',
      suffix: 'Kauffman Fellow',
      bio: 'Investing in seed-stage founders across AI infrastructure, B2B SaaS, and consumer tech. Always excited to meet passionate builders.',
    },
  },
] : [];

type CardsListener = (cards: BusinessCard[]) => void;
const listeners = new Set<CardsListener>();

export function subscribeCards(listener: CardsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCardListeners(): void {
  const current = getCards();
  // Keep both the collection screen and any already-mounted card detail screen
  // on the same object after an edit. Card detail queries use a separate cache
  // key and otherwise remain fresh for their stale-time window, showing the
  // pre-edit layout when the editor is popped.
  queryClient.setQueryData<BusinessCard[]>(queryKeys.cards, [...current]);
  current.forEach((card) => {
    queryClient.setQueryData<BusinessCard>(queryKeys.card(card.id), card);
  });
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.error('Error notifying cards listener:', e);
    }
  });
}

export function getCards(): BusinessCard[] {
  return CARDS;
}

function prefetchCardMedia(cards: BusinessCard[]) {
  prefetchMedia(cards.flatMap((card) => [
    card.sectionOverrides.profilePhoto,
    card.sectionOverrides.coverPhoto,
    card.sectionOverrides.logo,
  ]));
}
export function clearCardState(): void {
  CARDS.splice(0, CARDS.length);
  lastCardsSyncFailed = false;
  notifyCardListeners();
}

/** A new card in the standard ProsCard design (default theme and layouts), filled from the profile. */
export function buildDefaultCard(profile: Partial<Profile>): BusinessCard {
  const gradient: [string, string] = [DEFAULT_CARD_THEME.gradient[0], DEFAULT_CARD_THEME.gradient[1]];
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return normalizeCard({
    id: `new-${Date.now()}`,
    category: 'Professional',
    name: profile.preferredName?.trim() || fullName || profile.fullName?.trim() || 'My ProsCard',
    title: profile.title?.trim() ?? '',
    company: profile.organization?.trim() ?? '',
    phone: profile.phone?.trim() ?? '',
    email: profile.email?.trim() ?? '',
    gradient,
    ...defaultSectionData(gradient),
  });
}

/** Creates and registers a default-design card on the backend. */
export function createDefaultCard(profile: Partial<Profile>): Promise<BusinessCard> {
  return saveCard(buildDefaultCard(profile));
}

let ensureDefaultCardPromise: Promise<BusinessCard | null> | null = null;

/** Gives a signed-in user with no cards their first default card; concurrent calls share one request. */
export function ensureDefaultCard(profile: Partial<Profile>): Promise<BusinessCard | null> {
  if (CARDS.length > 0) return Promise.resolve(null);
  ensureDefaultCardPromise ??= createDefaultCard(profile).finally(() => {
    ensureDefaultCardPromise = null;
  });
  return ensureDefaultCardPromise;
}

export function getCardById(cardId: string): BusinessCard | undefined {
  return CARDS.find((card) => card.id === cardId);
}

export async function fetchCardById(cardId: string): Promise<BusinessCard> {
  if (AUTH_TEST_MODE) {
    const card = getCardById(cardId);
    if (!card) throw new Error('Card not found.');
    return card;
  }
  const card = normalizeCard(await apiRequest<BusinessCard>(`/cards/${encodeURIComponent(cardId)}`));
  const index = CARDS.findIndex((item) => item.id === card.id);
  if (index >= 0) CARDS[index] = card; else CARDS.push(card);
  notifyCardListeners();
  prefetchCardMedia([card]);
  return card;
}

export async function hydrateCards(): Promise<BusinessCard[]> {
  const userCardsKey = await scopedCardKey(USER_CARDS_KEY);
  const primaryCardKey = await scopedCardKey(PRIMARY_CARD_KEY);
  try {
    if (!AUTH_TEST_MODE) {
      try {
        const remoteCards = await apiRequest<BusinessCard[]>('/cards');
        lastCardsSyncFailed = false;
        const normalizedCards = remoteCards.map(normalizeCard);
        CARDS.splice(0, CARDS.length, ...normalizedCards);
        await AsyncStorage.setItem(userCardsKey, JSON.stringify(normalizedCards));
        notifyCardListeners();
        prefetchCardMedia(normalizedCards);
        return CARDS;
      } catch (error) {
        lastCardsSyncFailed = true;
        console.warn('Using cached cards because synchronization failed:', error);
      }
    }
    const rawUserCards = await AsyncStorage.getItem(userCardsKey);
    if (rawUserCards) {
      const parsed = JSON.parse(rawUserCards) as BusinessCard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalizedCards = parsed.map(normalizeCard);
        CARDS.splice(0, CARDS.length, ...normalizedCards);
        await AsyncStorage.setItem(userCardsKey, JSON.stringify(normalizedCards));
        notifyCardListeners();
        prefetchCardMedia(normalizedCards);
        return CARDS;
      }
    }

    const rawPrimary = await AsyncStorage.getItem(primaryCardKey);
    if (rawPrimary) {
      const parsedPrimary = JSON.parse(rawPrimary) as BusinessCard;
      if (parsedPrimary && typeof parsedPrimary === 'object') {
        CARDS[0] = normalizeCard({ ...CARDS[0], ...parsedPrimary });
        await AsyncStorage.setItem(primaryCardKey, JSON.stringify(CARDS[0]));
        notifyCardListeners();
        prefetchCardMedia([CARDS[0]]);
        return CARDS;
      }
    }
  } catch (error) {
    console.error('Failed to hydrate cards from storage:', error);
  }
  return CARDS;
}

export async function savePrimaryCard(profileData: Partial<BusinessCard>): Promise<BusinessCard> {
  const currentPrimary = CARDS[0] || {
    id: '1',
    category: 'Professional',
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    gradient: [Colors.light.tint, Colors.palette.brandCyan],
    ...defaultSectionData(),
  };

  const updatedCard: BusinessCard = {
    ...currentPrimary,
    ...profileData,
    id: currentPrimary.id || '1',
    category: profileData.category || currentPrimary.category || 'Professional',
    gradient: profileData.gradient || currentPrimary.gradient || [Colors.light.tint, Colors.palette.brandCyan],
    name: profileData.name !== undefined ? profileData.name : currentPrimary.name,
    title: profileData.title !== undefined ? profileData.title : currentPrimary.title,
    company: profileData.company !== undefined ? profileData.company : currentPrimary.company,
    phone: profileData.phone !== undefined ? profileData.phone : currentPrimary.phone,
    email: profileData.email !== undefined ? profileData.email : currentPrimary.email,
  };

  if (!AUTH_TEST_MODE) {
    const existing = CARDS[0];
    const saved = existing && isServerCardId(existing.id)
      ? await updateRemoteCard(existing.id, updatedCard)
      : await createRemoteCard(updatedCard);
    if (existing && isServerCardId(existing.id)) CARDS[0] = saved;
    else CARDS.splice(0, CARDS.length, saved);
  } else {
    CARDS[0] = updatedCard;
  }

  // 1. Immediately notify active in-memory listeners
  notifyCardListeners();
  prefetchCardMedia([CARDS[0]]);

  // 2. Persist to AsyncStorage asynchronously
  try {
    await AsyncStorage.setItem(await scopedCardKey(PRIMARY_CARD_KEY), JSON.stringify(updatedCard));
    await AsyncStorage.setItem(await scopedCardKey(USER_CARDS_KEY), JSON.stringify(CARDS));
  } catch (error) {
    console.error('Failed to persist primary card:', error);
  }

  return CARDS[0];
}

export async function saveCard(updated: BusinessCard): Promise<BusinessCard> {
  let normalized = normalizeCard(updated);
  const existingIndex = CARDS.findIndex((card) => card.id === normalized.id);
  if (!AUTH_TEST_MODE) {
    if (existingIndex >= 0 && isServerCardId(normalized.id)) {
      normalized = await prepareCardMedia(normalized, CARDS[existingIndex]);
      normalized = await updateRemoteCard(normalized.id, normalized);
    } else {
      const withoutLocalMedia = {
        ...normalized,
        sectionOverrides: Object.fromEntries(Object.entries(normalized.sectionOverrides).map(([key, value]) => [key, isPendingMediaUrl(value) ? '' : value])),
      };
      const created = await createRemoteCard(withoutLocalMedia);
      normalized = await prepareCardMedia({ ...normalized, id: created.id }, created);
      normalized = await updateRemoteCard(created.id, normalized);
    }
  }
  const index = CARDS.findIndex((card) => card.id === normalized.id);
  if (index >= 0) CARDS[index] = normalized;
  else CARDS.push(normalized);
  notifyCardListeners();
  prefetchCardMedia([normalized]);
  await AsyncStorage.setItem(await scopedCardKey(USER_CARDS_KEY), JSON.stringify(CARDS));
  if (normalized.id === CARDS[0]?.id) {
    await AsyncStorage.setItem(await scopedCardKey(PRIMARY_CARD_KEY), JSON.stringify(normalized));
  }
  return normalized;
}

async function prepareCardMedia(card: BusinessCard, previous: BusinessCard): Promise<BusinessCard> {
  const nextOverrides = { ...card.sectionOverrides };
  const fields = [
    ['profilePhoto', 'profilePhoto'], ['coverPhoto', 'coverPhoto'], ['logo', 'companyLogo'],
  ] as const;
  for (const [field, kind] of fields) {
    const next = nextOverrides[field] ?? '';
    const old = previous.sectionOverrides[field] ?? '';
    if (isPendingMediaUrl(next)) {
      nextOverrides[field] = await commitPendingMedia(next, kind, 'card', card.id);
    } else if (!next && old) {
      const mediaId = mediaIdFromContentUrl(old);
      if (mediaId) await deleteMedia(mediaId);
    }
  }
  return normalizeCard({ ...card, sectionOverrides: nextOverrides });
}

function cardPayload(card: BusinessCard): Omit<BusinessCard, 'id' | 'createdAt' | 'updatedAt'> {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = card;
  return payload;
}

async function createRemoteCard(card: BusinessCard): Promise<BusinessCard> {
  return normalizeCard(await apiRequest<BusinessCard>('/cards', {
    method: 'POST', body: cardPayload(card),
  }));
}

async function updateRemoteCard(id: string, card: BusinessCard): Promise<BusinessCard> {
  return normalizeCard(await apiRequest<BusinessCard>(`/cards/${encodeURIComponent(id)}`, {
    method: 'PUT', body: cardPayload(card),
  }));
}

function isServerCardId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function deleteCard(cardId: string): Promise<void> {
  const card = CARDS.find((item) => item.id === cardId);
  if (card?.isPrimary) throw new Error('The primary card cannot be deleted. Make another card primary first.');
  if (!AUTH_TEST_MODE) {
    await apiRequest(`/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' });
  }
  const index = CARDS.findIndex((card) => card.id === cardId);
  if (index >= 0) CARDS.splice(index, 1);
  await AsyncStorage.setItem(await scopedCardKey(USER_CARDS_KEY), JSON.stringify(CARDS));
  notifyCardListeners();
  queryClient.removeQueries({ queryKey: queryKeys.card(cardId) });
}

export async function setPrimaryCard(cardId: string): Promise<BusinessCard> {
  const existing = CARDS.find((card) => card.id === cardId);
  if (!existing) throw new Error('Card not found.');
  const primary = AUTH_TEST_MODE
    ? normalizeCard({ ...existing, isPrimary: true })
    : normalizeCard(await apiRequest<BusinessCard>(`/cards/${encodeURIComponent(cardId)}/primary`, { method: 'PUT' }));
  for (let index = 0; index < CARDS.length; index += 1) {
    CARDS[index] = normalizeCard({ ...CARDS[index], isPrimary: CARDS[index].id === cardId });
  }
  CARDS.sort((left, right) => Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary)));
  await Promise.all([
    AsyncStorage.setItem(await scopedCardKey(PRIMARY_CARD_KEY), JSON.stringify(primary)),
    AsyncStorage.setItem(await scopedCardKey(USER_CARDS_KEY), JSON.stringify(CARDS)),
  ]);
  notifyCardListeners();
  return primary;
}
