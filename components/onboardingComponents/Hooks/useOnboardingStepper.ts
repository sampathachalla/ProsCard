// components/onboardingComponents/Hooks/useOnboardingStepper.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  getProfile,
  getStoredUser,
  saveProfile,
} from '@/services/profileService';
import { setHasCompletedOnboarding } from '@/services/onboardingService';
import { savePrimaryCard } from '@/services/cardsService';

import type {
  OnboardingDraft,
  StepMetadata,
  UseOnboardingStepperReturn,
} from '../types/onboardingStepper.types';
import {
  INITIAL_ONBOARDING_DRAFT,
  ONBOARDING_STEPS_META,
} from '../types/onboardingStepper.types';
import {
  validateStep,
  validateAllSteps,
} from '../Utils/validateOnboarding';
import {
  mapDraftToProfile,
  mapDraftToBusinessCard,
  mapProfileToDraft,
} from '../Utils/onboardingMappers';

export function useOnboardingStepper(): UseOnboardingStepperReturn {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_ONBOARDING_DRAFT);
  const draftRef = useRef<OnboardingDraft>(INITIAL_ONBOARDING_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const totalSteps = ONBOARDING_STEPS_META.length; // 5

  // Initial user/profile hydration
  useEffect(() => {
    let isMounted = true;
    Promise.all([getStoredUser(), getProfile()]).then(([user, existingProfile]) => {
      if (!isMounted) return;
      setDraft((prev) => {
        const profileDraft = mapProfileToDraft(existingProfile);
        const next = {
          ...prev,
          ...profileDraft,
          fullName: profileDraft.fullName || user?.username || '',
          firstName: profileDraft.firstName || user?.username || '',
        };
        draftRef.current = next;
        return next;
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update draft and clear field error on input
  const updateDraft = useCallback((fields: Partial<OnboardingDraft>) => {
    draftRef.current = { ...draftRef.current, ...fields };
    setDraft((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const keys = Object.keys(fields);
      let hasChange = false;
      const nextErrors = { ...prev };
      for (const k of keys) {
        if (nextErrors[k]) {
          delete nextErrors[k];
          hasChange = true;
        }
      }
      return hasChange ? nextErrors : prev;
    });
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const activeStepMeta: StepMetadata = useMemo(() => {
    return ONBOARDING_STEPS_META[currentStep - 1] || ONBOARDING_STEPS_META[0];
  }, [currentStep]);

  const canGoBack = currentStep > 1 && !isSaving;
  const isLastStep = currentStep === totalSteps;

  // Next Step with validation
  const nextStep = useCallback((): boolean => {
    if (isSaving) return false;

    const stepErrors = validateStep(currentStep, draftRef.current);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return false;
    }

    setErrors({});
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    return true;
  }, [currentStep, isSaving, totalSteps]);

  // Previous Step
  const prevStep = useCallback(() => {
    if (currentStep > 1 && !isSaving) {
      setErrors({});
      setCurrentStep((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [currentStep, isSaving]);

  // Direct Jump via Step Indicator
  const goToStep = useCallback(
    (targetStep: number) => {
      if (
        isSaving ||
        typeof targetStep !== 'number' ||
        !Number.isInteger(targetStep) ||
        isNaN(targetStep) ||
        targetStep < 1 ||
        targetStep > totalSteps ||
        targetStep === currentStep
      ) {
        return;
      }

      if (targetStep < currentStep) {
        // Jumping back is always allowed
        setErrors({});
        setCurrentStep(targetStep);
        Haptics.selectionAsync().catch(() => {});
      } else {
        // Validate each step from currentStep up to targetStep - 1
        for (let s = currentStep; s < targetStep; s++) {
          const stepErrors = validateStep(s, draftRef.current);
          if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setCurrentStep(s);
            return;
          }
        }
        setErrors({});
        setCurrentStep(targetStep);
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [currentStep, isSaving, totalSteps]
  );

  // Skip Step logic
  const skipStep = useCallback(() => {
    if (isSaving) return;

    if (currentStep === 1) {
      // Skip welcome overview straight to Step 2
      setErrors({});
      setCurrentStep(2);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }

    if (currentStep === 4) {
      // Step 4 (Socials) is optional -> advance directly to Step 5
      setErrors({});
      setCurrentStep(5);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }

    // On mandatory steps (Step 2 and Step 3), invoke nextStep() to display required errors
    nextStep();
  }, [currentStep, isSaving, nextStep]);

  // Finalize Onboarding: Persist Profile + Primary Card + Completion Flag
  const finalizeOnboarding = useCallback(async (): Promise<boolean> => {
    if (isSaving) return false;

    const currentDraft = draftRef.current;
    const { isValid, errors: allErrors, firstErrorStep } = validateAllSteps(currentDraft);
    if (!isValid) {
      setErrors(allErrors);
      if (firstErrorStep) setCurrentStep(firstErrorStep);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Incomplete Profile', 'Please fill in the required fields before completing setup.');
      return false;
    }

    setIsSaving(true);
    try {
      // 1. Prepare Profile entity via mapper
      const profileToSave = mapDraftToProfile(currentDraft);

      // 2. Prepare Primary Business Card via mapper
      const primaryCard = mapDraftToBusinessCard(currentDraft);

      // 3. Concurrent Persistence
      await Promise.all([
        saveProfile(profileToSave),
        savePrimaryCard(primaryCard),
        setHasCompletedOnboarding(),
      ]);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(tabs)/homepage');
      return true;
    } catch (err: unknown) {
      console.error('Error finalizing onboarding:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const errorMessage = err instanceof Error ? err.message : 'Could not save your profile. Please try again.';
      Alert.alert('Save Failed', errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, router]);

  return {
    currentStep,
    totalSteps,
    draft,
    errors,
    isSaving,
    canGoBack,
    isLastStep,
    activeStepMeta,
    updateDraft,
    clearError,
    goToStep,
    nextStep,
    prevStep,
    skipStep,
    finalizeOnboarding,
  };
}
