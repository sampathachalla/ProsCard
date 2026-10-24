// pages/onboarding/OnboardingPage.tsx
import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStepper } from '@/pages/onboarding/Hooks/useOnboardingStepper';
import { OnboardingFlowRenderer } from '@/pages/onboarding/Components/OnboardingFlowRenderer';
import { OnboardingFlowFooter } from '@/pages/onboarding/Components/OnboardingFlowFooter';
import { OnboardingFlowHeader } from '@/pages/onboarding/Components/OnboardingFlowHeader';
import {
  countProgressSteps,
  progressStepIndex,
} from '@/pages/onboarding/types/onboardingFlow.types';

export function OnboardingScreen() {
  const {
    currentItem,
    draft,
    updateDraft,
    errors,
    isSaving,
    canGoBack,
    canSkip,
    flowIndex,
    nextStep,
    prevStep,
    skipStep,
    finalizeOnboarding,
  } = useOnboardingStepper();

  const isWelcome = currentItem.kind === 'welcome';
  const isComplete = currentItem.kind === 'complete';
  const showChrome = !isWelcome && !isComplete;

  const totalProgressSteps = useMemo(() => countProgressSteps(), []);
  const activeProgressIndex = useMemo(() => progressStepIndex(flowIndex), [flowIndex]);

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={isWelcome || isComplete ? ['top'] : ['top', 'left', 'right']}
    >
      {showChrome ? (
        <OnboardingFlowHeader
          canGoBack={canGoBack}
          canSkip={canSkip}
          isSaving={isSaving}
          progressIndex={Math.max(0, activeProgressIndex)}
          totalProgressSteps={totalProgressSteps}
          onBack={prevStep}
          onSkip={skipStep}
        />
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <View className="flex-1">
          <OnboardingFlowRenderer
            currentItem={currentItem}
            draft={draft}
            errors={errors}
            isSaving={isSaving}
            updateDraft={updateDraft}
            onWelcomeNext={nextStep}
            onWelcomeSkip={skipStep}
            onFinish={finalizeOnboarding}
          />
        </View>

        <OnboardingFlowFooter
          currentItem={currentItem}
          isSaving={isSaving}
          onContinue={nextStep}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default OnboardingScreen;
