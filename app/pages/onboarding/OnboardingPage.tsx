// pages/onboarding/OnboardingPage.tsx
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/common/ui/Text';
import { logout } from '@/pages/auth/Services/authService';
import { useOnboardingStepper } from '@/pages/onboarding/Hooks/useOnboardingStepper';
import { OnboardingFlowRenderer } from '@/pages/onboarding/Components/OnboardingFlowRenderer';
import { OnboardingFlowFooter } from '@/pages/onboarding/Components/OnboardingFlowFooter';
import { OnboardingFlowHeader } from '@/pages/onboarding/Components/OnboardingFlowHeader';
import {
  countProgressSteps,
  progressStepIndex,
} from '@/pages/onboarding/types/onboardingFlow.types';

export function OnboardingScreen() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    currentItem,
    draft,
    updateDraft,
    errors,
    isSaving,
    isGeneratingCopy,
    copyAssist,
    canGoBack,
    canSkip,
    flowIndex,
    completionPercent,
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      router.replace('/auth/welcome');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={isWelcome || isComplete ? ['top'] : ['top', 'left', 'right']}
    >
      {Platform.OS === 'android' ? (
        <Pressable
          accessibilityRole="button"
          disabled={isSaving || isSigningOut}
          onPress={handleSignOut}
          className="mr-5 min-h-[48px] self-end justify-center px-3 active:opacity-70 disabled:opacity-50"
        >
          <Text variant="none" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </Pressable>
      ) : null}
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
            isGeneratingCopy={isGeneratingCopy}
            copyAssist={copyAssist}
            completionPercent={completionPercent}
            updateDraft={updateDraft}
            onWelcomeNext={nextStep}
            onBack={canGoBack ? prevStep : undefined}
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
