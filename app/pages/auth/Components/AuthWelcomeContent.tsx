import { useEffect, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';

import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { AuthWelcomeFeatureCarousel } from '@/pages/auth/Components/AuthWelcomeFeatureCarousel';

export interface AuthWelcomeContentProps {
  onGetStarted: () => void;
  footer?: ReactNode;
}

/** Top VCPROS official brand logo positioned with balanced top breathing room. */
export function WelcomeBrandHeader() {
  return (
    <View className="w-full items-center px-6 pb-1 pt-4">
      <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
    </View>
  );
}

/** Gentle repeating pulse with an arrow nudge; pauses between beats and stays still under Reduce Motion. */
function useGetStartedNudge() {
  const reduceMotion = useReducedMotion();
  const nudge = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const beat = { duration: 450, easing: Easing.inOut(Easing.quad) };
    nudge.value = withRepeat(
      withSequence(withDelay(1800, withTiming(1, beat)), withTiming(0, beat)),
      -1,
      false,
    );
  }, [nudge, reduceMotion]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + nudge.value * 0.03 }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nudge.value * 6 }],
  }));

  return { buttonStyle, arrowStyle };
}

/** App entry welcome — VCPros brand header, 3-slide illustrated carousel, and CTA. */
export function AuthWelcomeContent({ onGetStarted, footer }: AuthWelcomeContentProps) {
  const { buttonStyle, arrowStyle } = useGetStartedNudge();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <View className="flex-1 justify-between pb-4 pt-1">
      <WelcomeBrandHeader />

      <Animated.View
        entering={FadeInDown.delay(80).duration(420)}
        className="min-h-0 flex-1 w-full"
      >
        <AuthWelcomeFeatureCarousel />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(420)}
        className="w-full px-6 pt-3"
      >
        <Animated.View style={buttonStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started"
            onPress={handleGetStarted}
            className="min-h-[54px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl bg-primary px-6 py-3.5 shadow-lg shadow-blue-500/25 active:scale-[0.99] active:opacity-90 dark:bg-[#2563eb]"
          >
            <Animated.View style={arrowStyle}>
              <ArrowRight color="#FFFFFF" size={19} strokeWidth={2.4} />
            </Animated.View>
            <Text variant="none" className="text-[16px] font-semibold text-white">
              Get started
            </Text>
          </Pressable>
        </Animated.View>

        {footer ? <View className="mt-4 items-center">{footer}</View> : null}
      </Animated.View>
    </View>
  );
}
