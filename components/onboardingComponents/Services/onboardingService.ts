import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, QrCode, Users } from 'lucide-react-native';
import type { OnboardingSlide } from '../types/onboarding.types';

const ONBOARDING_STORAGE_KEY = 'hasCompletedOnboarding';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'cards',
    icon: CreditCard,
    title: 'Your digital business cards',
    description: 'Create and manage multiple professional cards, all in one place.',
  },
  {
    id: 'scan',
    icon: QrCode,
    title: 'Share with a scan',
    description: 'Show your QR code or scan someone else’s to exchange details instantly.',
  },
  {
    id: 'contacts',
    icon: Users,
    title: 'Never lose a contact',
    description: 'Everyone you connect with is saved and searchable in your contacts list.',
  },
];

export async function getHasCompletedOnboarding(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
  return raw === 'true';
}

export async function setHasCompletedOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}
