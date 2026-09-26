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
  ONBOARDING_FLOW,
  flowIndexForField,
  indexAfterSkip,
  isFlowItemSkippable,
  type OnboardingFlowItem,
} from '../types/onboardingFlow.types';
import { validateAllSteps } from '../Utils/validateOnboarding';
import { validateFlowGroup } from '../Utils/validateOnboardingFlowGroup';
import {
  mapDraftToProfile,
  mapDraftToBusinessCard,
  mapProfileToDraft,
} from '../Utils/onboardingMappers';

export function useOnboardingStepper(): UseOnboardingStepperReturn {
  const router = useRouter();

  const [flowIndex, setFlowIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_ONBOARDING_DRAFT);
  const draftRef = useRef<OnboardingDraft>(INITIAL_ONBOARDING_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const totalSteps = ONBOARDING_FLOW.length;
  const currentItem: OnboardingFlowItem = ONBOARDING_FLOW[flowIndex] ?? ONBOARDING_FLOW[0];

  // Legacy coarse step for tests / compat (welcome = 1, everything else = 2–5 bucket)
  const currentStep = useMemo(() => {
    if (currentItem.kind === 'welcome') return 1;
    if (currentItem.kind === 'card_style') return 5;
    const groupId = currentItem.kind === 'group' ? currentItem.groupId : null;
    if (!groupId) return 2;
    if (groupId === 'name_legal' || groupId === 'name_formal' || groupId === 'role_company' || groupId === 'credentials') {
      return 2;
    }
    if (groupId === 'contact_email' || groupId === 'contact_phone' || groupId === 'work_extra') {
      return 3;
    }
    if (groupId === 'presence') return 4;
    return 5;
  }, [currentItem]);

  const hasHydratedFromStorageRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getStoredUser(), getProfile()]).then(([user, existingProfile]) => {
      if (!isMounted || hasHydratedFromStorageRef.current) return;
      hasHydratedFromStorageRef.current = true;
      setDraft((prev) => {
        const profileDraft = mapProfileToDraft(existingProfile);
        const next = {
          ...prev,
          ...profileDraft,
          fullName: profileDraft.fullName || user?.username || '',
          firstName: profileDraft.firstName || user?.username || prev.firstName,
        };
        draftRef.current = next;
        return next;
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const canGoBack = flowIndex > 0 && !isSaving;
  const isLastStep = currentItem.kind === 'card_style';
  const canSkip = isFlowItemSkippable(currentItem) && !isSaving;

  const progressLabel = useMemo(
    () => `${flowIndex + 1} of ${ONBOARDING_FLOW.length}`,
    [flowIndex]
  );

  const nextStep = useCallback((): boolean => {
    if (isSaving) return false;

    const item = ONBOARDING_FLOW[flowIndex];

    if (item.kind === 'welcome') {
      setErrors({});
      if (flowIndex < ONBOARDING_FLOW.length - 1) {
        setFlowIndex((prev) => prev + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return true;
    }

    if (item.kind === 'group') {
      const groupErrors = validateFlowGroup(item.groupId, draftRef.current);
      if (Object.keys(groupErrors).length > 0) {
        setErrors(groupErrors);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        return false;
      }
      setErrors({});
      if (flowIndex < ONBOARDING_FLOW.length - 1) {
        setFlowIndex((prev) => prev + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return true;
    }

    return true;
  }, [flowIndex, isSaving]);

  const prevStep = useCallback(() => {
    if (flowIndex > 0 && !isSaving) {
      setErrors({});
      setFlowIndex((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [flowIndex, isSaving]);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (isSaving) return;
      if (!Number.isFinite(targetStep) || !Number.isInteger(targetStep)) return;
      if (targetStep < 1 || targetStep > 5) return;

      let matchIndex = -1;
      if (targetStep === 1) {
        matchIndex = 0;
      } else if (targetStep === 2) {
        matchIndex = ONBOARDING_FLOW.findIndex(
          (flowItem) => flowItem.kind === 'group' && flowItem.groupId === 'name_legal'
        );
      } else if (targetStep === 3) {
        matchIndex = ONBOARDING_FLOW.findIndex(
          (flowItem) => flowItem.kind === 'group' && flowItem.groupId === 'contact_email'
        );
      } else if (targetStep === 4) {
        matchIndex = ONBOARDING_FLOW.findIndex(
          (flowItem) => flowItem.kind === 'group' && flowItem.groupId === 'presence'
        );
      } else if (targetStep === 5) {
        matchIndex = ONBOARDING_FLOW.findIndex((flowItem) => flowItem.kind === 'card_style');
      }

      if (matchIndex >= 0) {
        setErrors({});
        setFlowIndex(matchIndex);
      }
    },
    [isSaving]
  );

  const skipStep = useCallback(() => {
    if (isSaving) return;

    const item = ONBOARDING_FLOW[flowIndex];
    if (item.kind === 'welcome') {
      setErrors({});
      setFlowIndex(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }

    if (!isFlowItemSkippable(item)) return;

    setErrors({});
    setFlowIndex(indexAfterSkip(flowIndex));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [flowIndex, isSaving]);

  const finalizeOnboarding = useCallback(async (): Promise<boolean> => {
    if (isSaving) return false;

    const currentDraft = draftRef.current;
    const cardErrors = validateFlowGroup('card_style', currentDraft);
    if (Object.keys(cardErrors).length > 0) {
      setErrors(cardErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return false;
    }

    const { isValid, errors: allErrors } = validateAllSteps(currentDraft);
    if (!isValid) {
      setErrors(allErrors);
      const firstKey = Object.keys(allErrors)[0];
      if (firstKey) {
        setFlowIndex(flowIndexForField(firstKey));
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Incomplete Profile', 'Please fill in the required fields before completing setup.');
      return false;
    }

    setIsSaving(true);
    try {
      const profileToSave = mapDraftToProfile(currentDraft);
      const primaryCard = mapDraftToBusinessCard(currentDraft);

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
      const errorMessage =
        err instanceof Error ? err.message : 'Could not save your profile. Please try again.';
      Alert.alert('Save Failed', errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, router]);

  return {
    currentStep,
    totalSteps,
    flowIndex,
    currentItem,
    progressLabel,
    canSkip,
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
