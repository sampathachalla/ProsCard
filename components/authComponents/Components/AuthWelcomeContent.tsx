import { type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Button } from '@/components/uiComponents/Button';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Text } from '@/components/uiComponents/Text';
import { AuthWelcomeFeatureCarousel } from '@/components/authComponents/Components/AuthWelcomeFeatureCarousel';

export interface AuthWelcomeContentProps {
  onGetStarted: () => void;
  footer?: ReactNode;
}

/** App entry welcome — logo, ProsCard title, feature carousel, auth CTAs. */
export function AuthWelcomeContent({ onGetStarted, footer }: AuthWelcomeContentProps) {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <View className="flex-1 px-7 pb-7 pt-4">
      <Animated.View entering={FadeIn.duration(500)} className="shrink-0 items-center pt-6">
        <BrandLogo accessibilityLabel="MindPROS company logo" size="xl" variant="wordmark" />
        <View className="mt-5">
          <ProsCardTitle />
        </View>
        <Text className="mt-3 max-w-[280px] text-center text-[15px] leading-6 text-textMuted dark:text-dark-textMuted">
          Create your digital card in minutes. Edit anytime.
        </Text>
      </Animated.View>

      <View className="z-10 min-h-[200px] w-full flex-1 justify-center py-2">
        <Animated.View entering={FadeInDown.delay(100).duration(450)} className="w-full">
          <AuthWelcomeFeatureCarousel />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(450)}
        className="w-full max-w-[360px] shrink-0 self-center"
      >
        <Button
          label="Get started"
          variant="primary"
          size="lg"
          onPress={handleGetStarted}
          className="w-full rounded-xl"
        />
        {footer ? (
          <View className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}
