// app/(tabs)/onboardingPage.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { Button } from '@/components/uiComponents/Button';
import { useOnboardingStepper } from '@/components/onboardingComponents/Hooks/useOnboardingStepper';
import { OnboardingFlowRenderer } from '@/components/onboardingComponents/Components/OnboardingFlowRenderer';
import { OnboardingFlowFooter } from '@/components/onboardingComponents/Components/OnboardingFlowFooter';

export function OnboardingScreen() {
  const {
    currentItem,
    progressLabel,
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

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top', 'left', 'right']}
    >
      {showTopBar ? (
        <View className="flex-row items-center justify-between bg-background px-6 pb-1 pt-2 dark:bg-dark-background">
          {canGoBack ? (
            <Pressable
              onPress={handleTopBack}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Go back to previous step"
              className="-ml-1 flex-row items-center py-1 active:opacity-70"
            >
              <ChevronLeft
                size={20}
                className="mr-0.5 text-textPrimary dark:text-dark-textPrimary"
              />
              <Text className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                Back
              </Text>
            </Pressable>
          ) : (
            <View className="h-6" />
          )}

          <Text className="text-xs font-medium text-textMuted dark:text-dark-textMuted">
            {progressLabel}
          </Text>

          {canSkip ? (
            <Button
              label="Skip"
              variant="ghost"
              size="sm"
              onPress={skipStep}
              disabled={isSaving}
              className="min-h-0 px-2 py-1"
            />
          ) : (
            <View className="h-6 w-10" />
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
