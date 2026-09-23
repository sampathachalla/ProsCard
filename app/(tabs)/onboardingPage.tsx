// app/(tabs)/onboardingPage.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { useOnboardingStepper } from '@/components/onboardingComponents/Hooks/useOnboardingStepper';
import { StepperIndicator } from '@/components/onboardingComponents/Components/StepperIndicator';
import { StepperNavigation } from '@/components/onboardingComponents/Components/StepperNavigation';
import { StepWelcome } from '@/components/onboardingComponents/Components/StepWelcome';
import { StepPersonal } from '@/components/onboardingComponents/Components/StepPersonal';
import { StepProfessional } from '@/components/onboardingComponents/Components/StepProfessional';
import { StepSocial } from '@/components/onboardingComponents/Components/StepSocial';
import { StepCardCustomization } from '@/components/onboardingComponents/Components/StepCardCustomization';

export function OnboardingScreen() {
  const {
    currentStep,
    totalSteps,
    draft,
    updateDraft,
    errors,
    isSaving,
    canGoBack,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    skipStep,
    finalizeOnboarding,
  } = useOnboardingStepper();

  const handleTopBack = () => {
    if (!canGoBack) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    prevStep();
  };

  const handleTopSkip = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    skipStep();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top', 'left', 'right']}
    >
      {/* Top Header Action Bar with Back & Skip */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-1 bg-background dark:bg-dark-background">
        {canGoBack ? (
          <Pressable
            onPress={handleTopBack}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous step"
            className="flex-row items-center py-1 -ml-1 active:opacity-70"
          >
            <ChevronLeft size={20} className="text-textPrimary dark:text-dark-textPrimary mr-0.5" />
            <Text className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
              Back
            </Text>
          </Pressable>
        ) : (
          <View className="h-6" />
        )}

        {(currentStep === 1 || currentStep === 4) && !isSaving ? (
          <Pressable
            onPress={handleTopSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip step"
            className="py-1 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">
              Skip
            </Text>
          </Pressable>
        ) : (
          <View className="h-6" />
        )}
      </View>

      {/* Top Stepper Indicator */}
      <StepperIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepPress={(step) => goToStep(step)}
      />

      {/* Step Body Container */}
      <View className="flex-1">
        {currentStep === 1 && <StepWelcome onGetStarted={nextStep} />}
        {currentStep === 2 && (
          <StepPersonal draft={draft} updateDraft={updateDraft} errors={errors} />
        )}
        {currentStep === 3 && (
          <StepProfessional draft={draft} updateDraft={updateDraft} errors={errors} />
        )}
        {currentStep === 4 && (
          <StepSocial draft={draft} updateDraft={updateDraft} errors={errors} />
        )}
        {currentStep === 5 && (
          <StepCardCustomization
            draft={draft}
            updateDraft={updateDraft}
            onFinish={finalizeOnboarding}
            isSaving={isSaving}
          />
        )}
      </View>

      {/* Bottom Stepper Navigation Controls */}
      <StepperNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={isLastStep ? finalizeOnboarding : nextStep}
        onBack={prevStep}
        onSkip={currentStep === 1 || currentStep === 4 ? skipStep : undefined}
        nextLabel={
          isLastStep
            ? 'Create My Card'
            : currentStep === 1
            ? 'Get Started'
            : 'Continue'
        }
        isSaving={isSaving}
      />
    </SafeAreaView>
  );
}

export default OnboardingScreen;

