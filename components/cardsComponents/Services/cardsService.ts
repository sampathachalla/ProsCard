// components/cardsComponents/Services/cardsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { buildCustomSectionTheme } from '@/utils/cardThemeColor';
import { CARD_THEME_PRESETS, createDefaultCardSectionThemes, DEFAULT_CARD_SECTION_LAYOUTS, DEFAULT_CARD_THEME, type BusinessCard, type CardVisualTheme } from '../types/card.types';

const PRIMARY_CARD_KEY = 'primaryCard';
const USER_CARDS_KEY = 'userCards';

function themeForGradient(gradient: [string, string]): CardVisualTheme {
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
    customThemes: (card.customThemes ?? []).map((item) => ({
      ...item,
      gradient: [item.gradient[0], item.gradient[1]] as [string, string],
    })),
  };
}

export const CARDS: BusinessCard[] = [
  {
    id: '1',
    category: 'Professional',
    name: 'Dr. Sampath Kumar Kambhampati PhD',
    title: 'Founder & CEO',
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
      preferredName: 'Dr. Sampath Kambhampati',
      title: 'Founder & Chief Executive Officer',
      company: 'MindPros Technologies',
      tagline: 'Building next-generation digital networking tools for visionary professionals.',
      accreditations: 'MBA, AWS Certified Architect, PMP',
      prefix: 'Dr.',
      firstName: 'Sampath',
      middleName: 'Kumar',
      lastName: 'Kambhampati',
      suffix: 'PhD',
      bio: 'Founder and product architect dedicated to crafting high-impact digital experiences that empower creators, executives, and organizations to connect and build meaningful relationships globally.',
    },
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
      lastName: 'Kambhampati',
      suffix: '',
      bio: 'Specializing in design systems, micro-interactions, and mobile UX. Passionate about minimalism, typography, and human-computer interaction.',
    },
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
    sectionLayouts: {
      identity: 'bold',
      professional: 'bold',
      bio: 'bold',
      connections: 'bold',
    },
    sectionOverrides: {
      preferredName: 'Sampath Kambhampati',
      title: 'Principal AI & Full Stack Engineer',
      company: 'MindPros AI Labs',
      tagline: 'Scaling distributed intelligence and realtime agentic workflows.',
      accreditations: 'M.S. Computer Science, GCP Professional Cloud Architect',
      prefix: 'Eng.',
      firstName: 'Sampath',
      middleName: 'K.',
      lastName: 'Kambhampati',
      suffix: 'M.S.',
      bio: 'Deep expertise in React Native, TypeScript, cloud microservices, and neural search systems. Building scalable, resilient platforms for millions of users.',
    },
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
    sectionLayouts: {
      identity: 'glass',
      professional: 'glass',
      bio: 'glass',
      connections: 'glass',
    },
    sectionOverrides: {
      preferredName: 'Sampath Kambhampati',
      title: 'General Partner & Angel Investor',
      company: 'MindPros Ventures',
      tagline: 'Backing early-stage founders shaping the future of AI and developer tools.',
      accreditations: 'Kauffman Fellow, YC Alum',
      prefix: '',
      firstName: 'Sampath',
      middleName: '',
      lastName: 'Kambhampati',
      suffix: 'Kauffman Fellow',
      bio: 'Investing in seed-stage founders across AI infrastructure, B2B SaaS, and consumer tech. Always excited to meet passionate builders.',
    },
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
