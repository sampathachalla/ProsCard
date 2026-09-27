import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Home, Sparkles } from 'lucide-react-native';

import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { ProsCardTitle } from '@/components/uiComponents/ProsCardTitle';
import { Text } from '@/components/uiComponents/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface StepOnboardingCompleteProps {
  onGoHome: () => void;
  isSaving?: boolean;
}

export function StepOnboardingComplete({
  onGoHome,
  isSaving = false,
}: StepOnboardingCompleteProps) {
  const { width: screenWidth } = useWindowDimensions();
  const ctaWidth = Math.min(Math.round(screenWidth * 0.88), 380);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const gradientColors: [string, string, string] = isDark
    ? ['#020617', '#0a1128', '#0f172a']
    : ['#eef6ff', '#ffffff', '#f1f5f9'];

  const handlePress = () => {
    if (isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onGoHome();
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

      <View className="flex-1 justify-between px-6 pb-10 pt-28">
        <View className="w-full flex-1 items-center justify-center">
          <Animated.View
            entering={FadeInDown.delay(60).duration(500)}
            className={`w-full max-w-[420px] overflow-hidden rounded-none px-6 py-8 ${
              isDark
                ? 'bg-slate-900/55 shadow-lg shadow-black/40'
                : 'bg-white/85 shadow-xl shadow-slate-300/35'
            }`}
          >
            <Animated.View entering={FadeIn.duration(450)} className="items-center">
              <View className="mb-5 flex-row items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-1.5">
                <Sparkles size={14} color="#34d399" strokeWidth={2.2} />
                <Text
                  variant="none"
                  className="text-xs font-semibold uppercase tracking-wider text-emerald-400"
                >
                  Setup complete
                </Text>
              </View>

              <View className="mb-6 h-[72px] w-[72px] items-center justify-center rounded-full bg-emerald-500/12">
                <CheckCircle2 color="#34d399" size={40} strokeWidth={2.2} />
              </View>

              <BrandLogo accessibilityLabel="MindPROS company logo" size="xxl" variant="wordmark" />
              <View className="-mt-1">
                <ProsCardTitle accent={false} size="lg" tone="initials" />
              </View>

              <Text
                variant="none"
                className="mt-8 text-center text-[38px] font-bold leading-[42px] tracking-tight text-textPrimary dark:text-dark-textPrimary"
              >
                You&apos;re all set
              </Text>
              <Text
                variant="none"
                className="mt-4 max-w-[320px] text-center text-[15px] font-medium leading-[22px] text-slate-600 dark:text-slate-300"
              >
                Your card is ready. Open your homepage to view, edit, and share it anytime.
              </Text>
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(220).duration(450)}
          className="w-full items-center pt-6"
        >
          <LinearGradient
            colors={['#2563eb', '#0284c7', '#00a8e8']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.ctaGradient, { width: ctaWidth }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to homepage"
              disabled={isSaving}
              onPress={handlePress}
              className={`min-h-[54px] w-full flex-row items-center justify-center gap-2.5 px-6 py-3.5 ${
                isSaving ? 'opacity-50' : 'active:opacity-92'
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.palette.primaryWhite} size="small" />
              ) : (
                <>
                  <Home color={Colors.palette.primaryWhite} size={22} strokeWidth={2.2} />
                  <Text className="text-[17px] font-semibold tracking-wide text-white">
                    Go to homepage
                  </Text>
                </>
              )}
            </Pressable>
          </LinearGradient>
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
