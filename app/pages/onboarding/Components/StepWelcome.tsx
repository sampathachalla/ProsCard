import React from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  const isAndroid = Platform.OS === 'android';
  const Container = isAndroid ? ScrollView : View;
  const padding = { paddingTop: 6, paddingBottom: Math.max(insets.bottom, 16) + 8 };

  const handleGetStarted = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <Container
      className={`flex-1 bg-background dark:bg-dark-background ${isAndroid ? '' : 'justify-between'}`}
      {...(isAndroid ? { contentContainerStyle: { ...padding, flexGrow: 1 } } : { style: padding })}
    >
      <WelcomeBrandHeader />

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        className={isAndroid ? 'min-h-[420px] w-full grow' : 'min-h-0 flex-1 w-full'}
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
    </Container>
  );
}
