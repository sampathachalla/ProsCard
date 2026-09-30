import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, QrCode, Users } from 'lucide-react-native';
import type { OnboardingSlide } from '../types/onboarding.types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { apiRequest } from '@/services/api/client';
import type { OnboardingState } from '@/services/api/types';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { isPendingMediaUrl } from '@/components/profileComponents/Services/pendingMedia';
import { getSession } from '@/services/api/session';

const ONBOARDING_STORAGE_KEY = 'hasCompletedOnboarding';
async function onboardingStorageKey() {
  const session = await getSession();
  return session?.user.id ? `${ONBOARDING_STORAGE_KEY}:${session.user.id}` : ONBOARDING_STORAGE_KEY;
}

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
    try {
      const completed = (await getOnboardingState()).completed;
      await AsyncStorage.setItem(await onboardingStorageKey(), String(completed));
      return completed;
    } catch {
      return (await AsyncStorage.getItem(await onboardingStorageKey())) === 'true';
    }
  }
  const raw = await AsyncStorage.getItem(await onboardingStorageKey());
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
  const serializable = {
    ...draft,
    photoUrl: isPendingMediaUrl(draft.photoUrl) ? '' : draft.photoUrl,
    coverPhotoUrl: isPendingMediaUrl(draft.coverPhotoUrl) ? '' : draft.coverPhotoUrl,
    companyLogoUrl: isPendingMediaUrl(draft.companyLogoUrl) ? '' : draft.companyLogoUrl,
  };
  return apiRequest('/onboarding/draft', { method: 'PUT', body: serializable });
}

export async function setHasCompletedOnboarding(draft: object = {}): Promise<void> {
  if (!AUTH_TEST_MODE) {
    await apiRequest('/onboarding/complete', { method: 'POST', body: draft });
  }
  await AsyncStorage.setItem(await onboardingStorageKey(), 'true');
}
