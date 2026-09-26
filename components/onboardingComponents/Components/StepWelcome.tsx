import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Clock3 } from 'lucide-react-native';

import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Text } from '@/components/uiComponents/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface StepWelcomeProps {
  onGetStarted: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}

function GetStartedButton({
  onPress,
  isSaving,
  width,
}: {
  onPress: () => void;
  isSaving: boolean;
  width: number;
}) {
  const arrowX = useSharedValue(0);

  useEffect(() => {
    arrowX.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [arrowX]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  return (
    <LinearGradient
      colors={['#2563eb', '#0284c7', '#00a8e8']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.ctaGradient, { width }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Get started"
        disabled={isSaving}
        onPress={onPress}
        className={`min-h-[54px] w-full flex-row items-center justify-center gap-2.5 px-6 py-3.5 ${
          isSaving ? 'opacity-50' : 'active:opacity-92'
        }`}
      >
        {isSaving ? (
          <ActivityIndicator color={Colors.palette.primaryWhite} size="small" />
        ) : (
          <>
            <Text className="text-[17px] font-semibold tracking-wide text-white">Get started</Text>
            <Animated.View style={arrowStyle}>
              <ArrowRight color={Colors.palette.primaryWhite} size={20} strokeWidth={2.5} />
            </Animated.View>
          </>
        )}
      </Pressable>
    </LinearGradient>
  );
}

export function StepWelcome({ onGetStarted, onSkip, isSaving = false }: StepWelcomeProps) {
  const { width: screenWidth } = useWindowDimensions();
  const ctaWidth = Math.round(screenWidth * 0.8);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const gradientColors: [string, string, string] = isDark
    ? ['#020617', '#0a1128', '#0f172a']
    : ['#eef6ff', '#ffffff', '#f1f5f9'];

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
    <View className="flex-1">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.45, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{ pointerEvents: 'none' }}
        className={`absolute -right-20 top-16 h-72 w-72 rounded-full opacity-40 ${
          isDark ? 'bg-sky-500/15' : 'bg-sky-400/20'
        }`}
      />
      <View
        style={{ pointerEvents: 'none' }}
        className={`absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-35 ${
          isDark ? 'bg-indigo-600/15' : 'bg-blue-300/25'
        }`}
      />

      <View className="w-full flex-1 items-center justify-start pb-8 pt-24">
        <Animated.View
          entering={FadeInDown.delay(60).duration(500)}
          className={`w-full overflow-hidden px-6 py-8 ${
            isDark
              ? 'bg-slate-900/55 shadow-lg shadow-black/40'
              : 'bg-white/85 shadow-xl shadow-slate-300/35'
          }`}
        >
          <Animated.View entering={FadeIn.duration(450)} className="items-center">
            <BrandLogo accessibilityLabel="MindPROS company logo" size="lg" variant="wordmark" />
            <View className="mt-6">
              <ProsCardTitle size="4xl" />
            </View>
            <Text
              variant="none"
              className="mt-8 text-center text-[44px] font-bold leading-[48px] tracking-tight text-textPrimary dark:text-dark-textPrimary"
            >
              Welcome
            </Text>
          </Animated.View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(180).duration(450)}
          className="mt-4 w-full items-center"
        >
          <Text className="text-center text-[15px] font-medium leading-[22px] text-slate-600 dark:text-slate-300">
            You made a great choice.
          </Text>
          <View className="mt-2 w-full items-center">
          <GetStartedButton
            onPress={handleGetStarted}
            isSaving={isSaving}
            width={ctaWidth}
          />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
            disabled={isSaving}
            onPress={handleSkip}
            className={`mt-5 items-center py-2 ${isSaving ? 'opacity-50' : 'active:opacity-70'}`}
          >
            <Text className="text-[15px] font-medium text-slate-500 dark:text-slate-400">
              Skip for now
            </Text>
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center gap-1.5">
            <Clock3
              size={13}
              color={isDark ? Colors.palette.mutedLight : Colors.palette.muted}
              strokeWidth={2}
            />
            <Text className="text-[12px] font-medium text-textMuted dark:text-dark-textMuted">
              About 1 minute
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
});
