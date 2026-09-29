import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { Button } from '@/components/uiComponents/Button';

export interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  isSaving?: boolean;
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  nextLabel,
  isSaving = false,
}: StepperNavigationProps) {
  const insets = useSafeAreaInsets();
  const isLastStep = currentStep === totalSteps;
  const canGoBack = currentStep > 1 && !isSaving;
  // Steps 1 and 4 are skippable according to ONBOARDING_STEPS_META
  const canSkip = Boolean(onSkip) && (currentStep === 1 || currentStep === 4) && !isSaving;

  const defaultLabel = isLastStep
    ? 'Create My Card'
    : currentStep === 1
    ? 'Get Started'
    : 'Continue';
  const resolvedLabel = nextLabel || defaultLabel;

  const handleBack = () => {
    if (!canGoBack) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  const handleSkip = () => {
    if (!canSkip || !onSkip) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSkip();
  };

  const handleNext = () => {
    if (isSaving) return;
    onNext();
  };

  return (
    <View
      className="bg-background dark:bg-dark-background border-t border-slate-200/80 dark:border-slate-800/80 px-6 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {/* Optional Skip link */}
      {canSkip && (
        <View className="items-center mb-2">
          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip this step"
            className="py-1 px-3 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">
              Skip for now
            </Text>
          </Pressable>
        </View>
      )}

      {/* Main navigation button row */}
      <View className="flex-row items-center gap-3">
        {canGoBack && (
          <Pressable
            onPress={handleBack}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Go to previous step"
            className="flex-row items-center justify-center px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-[0.98] active:opacity-80"
          >
            <ChevronLeft size={20} className="text-textPrimary dark:text-dark-textPrimary mr-1" />
            <Text className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
              Back
            </Text>
          </Pressable>
        )}

        <View className="flex-1">
          <Button
            label={resolvedLabel}
            variant="primary"
            size="md"
            icon={isLastStep ? Check : ChevronRight}
            iconPosition="right"
            loading={isSaving}
            disabled={isSaving}
            onPress={handleNext}
            className="w-full rounded-2xl"
          />
        </View>
      </View>
    </View>
  );
}
