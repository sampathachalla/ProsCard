// app/(tabs)/onboardingPage.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { useOnboardingStepper } from '@/components/onboardingComponents/Hooks/useOnboardingStepper';
import { OnboardingFlowRenderer } from '@/components/onboardingComponents/Components/OnboardingFlowRenderer';
import { OnboardingFlowFooter } from '@/components/onboardingComponents/Components/OnboardingFlowFooter';

export function OnboardingScreen() {
  const {
    currentItem,
    draft,
    updateDraft,
    errors,
    isSaving,
    canGoBack,
    canSkip,
    isLastStep,
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

  const handleContinue = () => {
    nextStep();
  };

  const showTopBar = currentItem.kind !== 'welcome';

  const isWelcome = currentItem.kind === 'welcome';

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={isWelcome ? ['top'] : ['top', 'left', 'right']}
    >
      {showTopBar ? (
        <View className="bg-background px-6 pb-1 pt-2 dark:bg-dark-background">
          {canGoBack ? (
            <Pressable
              onPress={handleTopBack}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Go back to previous step"
              className="-ml-1 flex-row items-center py-2 active:opacity-70"
              hitSlop={8}
            >
              <ChevronLeft
                size={28}
                strokeWidth={2.5}
                className="-ml-0.5 mr-0.5 text-textPrimary dark:text-dark-textPrimary"
              />
              <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary">
                Back
              </Text>
            </Pressable>
          ) : (
            <View className="h-10" />
          )}
        </View>
      ) : null}

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
        canSkip={canSkip}
        isSaving={isSaving}
        isLastStep={isLastStep}
        onContinue={handleContinue}
        onSkip={skipStep}
        onFinalize={finalizeOnboarding}
      />
    </SafeAreaView>
  );
}

export default OnboardingScreen;
