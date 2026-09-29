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

/** App entry welcome — MindPROS mark stacked tightly over ProsCard wordmark. */
export function AuthWelcomeContent({ onGetStarted, footer }: AuthWelcomeContentProps) {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <View className="flex-1 px-7 pb-7 pt-4">
      {/* Branding + carousel share one stack so the gap stays small and visible. */}
      <View className="min-h-0 w-full flex-1 justify-center">
        <Animated.View entering={FadeIn.duration(500)} className="shrink-0 items-center">
          <BrandLogo accessibilityLabel="MindPROS company logo" size="xxl" variant="wordmark" />
          <View className="-mt-1">
            <ProsCardTitle accent={false} size="xl" tone="initials" />
          </View>
          <Text
            variant="none"
            className="mt-4 max-w-[300px] text-center text-[17px] leading-7 text-textMuted dark:text-dark-textMuted"
          >
            Create your digital card in minutes. Edit anytime.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(450)}
          className="mt-5 w-full shrink-0"
        >
          <AuthWelcomeFeatureCarousel />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(450)}
        className="w-full shrink-0 self-center pt-4"
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
