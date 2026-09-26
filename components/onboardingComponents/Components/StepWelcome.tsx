import React from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Button } from '@/components/uiComponents/Button';
import { Text } from '@/components/uiComponents/Text';

export interface StepWelcomeProps {
  onGetStarted: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}

export function StepWelcome({ onGetStarted, onSkip, isSaving = false }: StepWelcomeProps) {
  const handleGetStarted = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  const handleSkip = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSkip();
  };

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingTop: 12,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center">
        <Animated.View entering={FadeIn.duration(500)} className="items-center">
          <BrandLogo accessibilityLabel="MindPROS company logo" size="lg" variant="wordmark" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)} className="mt-10 items-center">
          <Text className="text-center text-[26px] font-bold leading-8 tracking-tight text-textPrimary dark:text-dark-textPrimary">
            Set up your{' '}
            <Text className="text-[26px] font-bold text-primary dark:text-dark-primary">ProsCard</Text>
          </Text>
          <Text className="mt-3 max-w-[300px] text-center text-[15px] leading-6 text-textMuted dark:text-dark-textMuted">
            A quick pass through the essentials for your card. You can change anything later.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(450)} className="mt-12 w-full max-w-[360px]">
          <Button
            label="Get started"
            variant="primary"
            size="lg"
            loading={isSaving}
            disabled={isSaving}
            onPress={handleGetStarted}
            className="w-full rounded-xl"
          />
          <Button
            label="Skip for now"
            variant="outline"
            size="lg"
            disabled={isSaving}
            onPress={handleSkip}
            className="mt-3 w-full rounded-xl"
          />
          <Text className="mt-3.5 text-center text-[12px] text-textMuted dark:text-dark-textMuted">
            About 1 minute
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
