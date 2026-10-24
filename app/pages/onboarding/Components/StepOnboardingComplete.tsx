import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Home, Pencil, QrCode, Share2, type LucideIcon } from 'lucide-react-native';

import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface StepOnboardingCompleteProps {
  onGoHome: () => void;
  isSaving?: boolean;
}

const NEXT_STEPS: { id: string; icon: LucideIcon; title: string; detail: string }[] = [
  {
    id: 'view',
    icon: Share2,
    title: 'Open your card',
    detail: 'Preview how others will see you',
  },
  {
    id: 'share',
    icon: QrCode,
    title: 'Share with QR',
    detail: 'Let people scan and save your info',
  },
  {
    id: 'edit',
    icon: Pencil,
    title: 'Edit anytime',
    detail: 'Update details, theme, and links later',
  },
];

export function StepOnboardingComplete({
  onGoHome,
  isSaving = false,
}: StepOnboardingCompleteProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const ctaWidth = Math.min(Math.round(screenWidth * 0.88), 380);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const iconColor = isDark ? Colors.palette.brandCyanLight : Colors.palette.brandCyan;
  const successColor = isDark ? '#34d399' : '#059669';

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
          isDark ? 'bg-emerald-600/12' : 'bg-emerald-300/20'
        }`}
      />

      <View
        className="flex-1 px-6"
        style={{
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <Animated.View entering={FadeIn.duration(400)} className="w-full items-center pt-2">
          <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).duration(420)}
          className="mt-8 w-full items-center"
        >
          <View
            className="mb-5 h-[88px] w-[88px] items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(52,211,153,0.10)' : 'rgba(16,185,129,0.12)' }}
          >
            <View
              className="h-[64px] w-[64px] items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(52,211,153,0.18)' : 'rgba(16,185,129,0.18)' }}
            >
              <CheckCircle2 color={successColor} size={36} strokeWidth={2.2} />
            </View>
          </View>

          <Text
            variant="none"
            className="text-center text-[34px] font-bold leading-[40px] tracking-tight text-textPrimary dark:text-dark-textPrimary"
          >
            You&apos;re all set
          </Text>
          <Text
            variant="none"
            className="mt-2.5 max-w-[320px] text-center text-[15px] font-medium leading-[22px] text-slate-600 dark:text-slate-300"
          >
            Your professional card is ready. Here&apos;s what you can do next.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(420)}
          className="mt-7 w-full gap-3"
        >
          {NEXT_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <View
                key={item.id}
                className={`flex-row items-center gap-3.5 rounded-2xl border px-3.5 py-3 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04]'
                    : 'border-slate-200/90 bg-white/80'
                }`}
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-xl ${
                    isDark ? 'bg-sky-400/15' : 'bg-sky-500/10'
                  }`}
                >
                  <Icon color={iconColor} size={21} strokeWidth={2.1} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-textPrimary dark:text-dark-textPrimary">
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-[13px] leading-5 text-textMuted dark:text-dark-textMuted">
                    {item.detail}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        <View className="flex-1" />

        <Animated.View
          entering={FadeInDown.delay(180).duration(420)}
          className="w-full items-center pt-4"
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
                isSaving ? 'opacity-50' : 'active:opacity-90'
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
