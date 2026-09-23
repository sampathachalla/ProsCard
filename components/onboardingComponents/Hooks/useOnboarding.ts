import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '@/components/profileComponents/types/profile.types';
import {
  DEFAULT_PROFILE,
  getStoredUser,
  saveProfile,
} from '@/components/profileComponents/Services/profileService';
import { validateProfile } from '@/components/profileComponents/Utils/validateProfile';
import { ONBOARDING_SLIDES, setHasCompletedOnboarding } from '../Services/onboardingService';

export type OnboardingPhase = 'intro' | 'form';

export function useOnboarding() {
  const router = useRouter();
  const [phase, setPhase] = useState<OnboardingPhase>('intro');
  const [activeIndex, setActiveIndex] = useState(0);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  useEffect(() => {
    getStoredUser().then((user) => {
      if (user?.username) {
        setDraft((prev) => (prev.fullName ? prev : { ...prev, fullName: user.username }));
      }
    });
  }, []);

  const goToForm = () => setPhase('form');

  const next = () => {
    if (isLastSlide) {
      goToForm();
      return;
    }
    setActiveIndex((index) => Math.min(index + 1, ONBOARDING_SLIDES.length - 1));
  };

  const skipIntro = () => goToForm();

  const backToIntro = () => setPhase('intro');

  const updateField = (field: ProfileFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: SocialFieldKey, value: string) => {
    setDraft((prev) => ({ ...prev, social: { ...prev.social, [field]: value } }));
  };

  const finish = async () => {
    const error = validateProfile(draft);
    if (error) {
      Alert.alert('Check your details', error);
      return;
    }
    setIsSaving(true);
    try {
      await saveProfile(draft);
      await setHasCompletedOnboarding();
      router.replace('/(tabs)/homepage');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    slides: ONBOARDING_SLIDES,
    phase,
    activeIndex,
    setActiveIndex,
    isLastSlide,
    draft,
    isSaving,
    next,
    skipIntro,
    backToIntro,
    updateField,
    updateSocial,
    finish,
  };
}
