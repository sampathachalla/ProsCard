import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import { AuthWelcomeFeatureCarousel } from '@/pages/auth/Components/AuthWelcomeFeatureCarousel';
import { WelcomeBrandHeader } from '@/pages/auth/Components/AuthWelcomeContent';

export interface StepWelcomeProps {
  onGetStarted: () => void;
  isSaving?: boolean;
}

export function StepWelcome({ onGetStarted, isSaving = false }: StepWelcomeProps) {
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <View
      className="flex-1 justify-between bg-background dark:bg-dark-background"
      style={{
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 16) + 8,
      }}
    >
      <Animated.View entering={FadeIn.duration(360)}>
        <WelcomeBrandHeader />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        className="min-h-0 flex-1 w-full"
      >
        <AuthWelcomeFeatureCarousel />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(400)}
        className="w-full items-center px-6 pt-3"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get started"
          disabled={isSaving}
          onPress={handleGetStarted}
          className={`min-h-[54px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl bg-primary px-6 py-3.5 shadow-lg shadow-blue-500/25 dark:bg-[#2563eb] ${
            isSaving ? 'opacity-50' : 'active:scale-[0.99] active:opacity-90'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <ArrowRight color="#FFFFFF" size={19} strokeWidth={2.4} />
              <Text variant="none" className="text-[16px] font-semibold text-white">
                Get started
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
