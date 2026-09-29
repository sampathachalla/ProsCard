import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, QrCode, Users } from 'lucide-react-native';
import type { OnboardingSlide } from '../types/onboarding.types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { apiRequest } from '@/services/api/client';
import type { OnboardingState } from '@/services/api/types';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';

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
  if (!AUTH_TEST_MODE) {
    return (await getOnboardingState()).completed;
  }
  const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
  return raw === 'true';
}

export async function getOnboardingState(): Promise<OnboardingState<OnboardingDraft>> {
  if (AUTH_TEST_MODE) {
    return { draft: {} as OnboardingDraft, completed: await getHasCompletedOnboarding(), completedAt: null };
  }
  return apiRequest<OnboardingState<OnboardingDraft>>('/onboarding');
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<OnboardingState<OnboardingDraft>> {
  if (AUTH_TEST_MODE) {
    return { draft, completed: false, completedAt: null };
  }
  return apiRequest('/onboarding/draft', { method: 'PUT', body: draft });
}

export async function setHasCompletedOnboarding(draft: object = {}): Promise<void> {
  if (!AUTH_TEST_MODE) {
    await apiRequest('/onboarding/complete', { method: 'POST', body: draft });
  }
  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}
