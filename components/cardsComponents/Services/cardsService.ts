// components/cardsComponents/Services/cardsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { CARD_THEME_PRESETS, createDefaultCardSectionThemes, DEFAULT_CARD_SECTION_LAYOUTS, DEFAULT_CARD_THEME, type BusinessCard, type CardVisualTheme } from '../types/card.types';

const PRIMARY_CARD_KEY = 'primaryCard';
const USER_CARDS_KEY = 'userCards';

function themeForGradient(gradient: [string, string]): CardVisualTheme {
  const preset = Object.values(CARD_THEME_PRESETS).find((item) => item.gradient[0].toLowerCase() === gradient[0].toLowerCase()) ?? DEFAULT_CARD_THEME;
  return { ...preset, gradient: [gradient[0], gradient[1]], fontStyle: 'modern' };
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
    sectionLayouts: { ...DEFAULT_CARD_SECTION_LAYOUTS, ...(card.sectionLayouts ?? {}) },
    sectionOverrides: { ...(card.sectionOverrides ?? {}) },
    connectionFields: Array.isArray(card.connectionFields) ? card.connectionFields : [],
    connectionFieldsCustomized: card.connectionFieldsCustomized ?? false,
    cardTheme,
    sectionThemes: Object.fromEntries(
      Object.entries(defaultThemes).map(([section, theme]) => {
        const savedTheme = card.sectionThemes?.[section as keyof typeof defaultThemes];
        return [section, savedTheme ? { ...theme, ...savedTheme, gradient: [...savedTheme.gradient] } : theme];
      }),
    ) as BusinessCard['sectionThemes'],
  };
}

export const CARDS: BusinessCard[] = [
  {
    id: '1',
    category: 'Professional',
    name: 'Sampath Kambhampati',
    title: 'Founder & CEO',
    company: 'ProsCard',
    phone: '+1 (555) 010-2030',
    email: 'sampath@proscard.app',
    gradient: [Colors.light.tint, Colors.palette.brandCyan],
    ...defaultSectionData([Colors.light.tint, Colors.palette.brandCyan]),
  },
  {
    id: '2',
    category: 'Personal',
    name: 'Sampath Kambhampati',
    title: 'Product Designer',
    company: 'MindPros Studio',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.studio',
    gradient: [Colors.palette.surfaceDark, Colors.palette.midnightBase],
    ...defaultSectionData([Colors.palette.surfaceDark, Colors.palette.midnightBase]),
  },
  {
    id: '3',
    category: 'Business',
    name: 'Sampath Kambhampati',
    title: 'Full Stack Engineer',
    company: 'MindPros AI',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.ai',
    gradient: ['#4f46e5', '#7c3aed'],
    ...defaultSectionData(['#4f46e5', '#7c3aed']),
  },
  {
    id: '4',
    category: 'Networking',
    name: 'Sampath Kambhampati',
    title: 'Angel Investor',
    company: 'MindPros Ventures',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.vc',
    gradient: ['#0f766e', '#059669'],
    ...defaultSectionData(['#0f766e', '#059669']),
  },
];

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

export function getCardById(cardId: string): BusinessCard | undefined {
  return CARDS.find((card) => card.id === cardId);
}

export async function hydrateCards(): Promise<BusinessCard[]> {
  try {
    const rawUserCards = await AsyncStorage.getItem(USER_CARDS_KEY);
    if (rawUserCards) {
      const parsed = JSON.parse(rawUserCards) as BusinessCard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalizedCards = parsed.map(normalizeCard);
        CARDS.splice(0, CARDS.length, ...normalizedCards);
        await AsyncStorage.setItem(USER_CARDS_KEY, JSON.stringify(normalizedCards));
        notifyCardListeners();
        return CARDS;
      }
    }

    const rawPrimary = await AsyncStorage.getItem(PRIMARY_CARD_KEY);
    if (rawPrimary) {
      const parsedPrimary = JSON.parse(rawPrimary) as BusinessCard;
      if (parsedPrimary && typeof parsedPrimary === 'object') {
        CARDS[0] = normalizeCard({ ...CARDS[0], ...parsedPrimary });
        await AsyncStorage.setItem(PRIMARY_CARD_KEY, JSON.stringify(CARDS[0]));
        notifyCardListeners();
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

  CARDS[0] = updatedCard;

  // 1. Immediately notify active in-memory listeners
  notifyCardListeners();

  // 2. Persist to AsyncStorage asynchronously
  try {
    await AsyncStorage.setItem(PRIMARY_CARD_KEY, JSON.stringify(updatedCard));
    await AsyncStorage.setItem(USER_CARDS_KEY, JSON.stringify(CARDS));
  } catch (error) {
    console.error('Failed to persist primary card:', error);
  }

  return updatedCard;
}

export async function saveCard(updated: BusinessCard): Promise<BusinessCard> {
  const normalized = normalizeCard(updated);
  const index = CARDS.findIndex((card) => card.id === normalized.id);
  if (index >= 0) CARDS[index] = normalized;
  else CARDS.push(normalized);
  notifyCardListeners();
  await AsyncStorage.setItem(USER_CARDS_KEY, JSON.stringify(CARDS));
  if (normalized.id === CARDS[0]?.id) {
    await AsyncStorage.setItem(PRIMARY_CARD_KEY, JSON.stringify(normalized));
  }
  return normalized;
}
