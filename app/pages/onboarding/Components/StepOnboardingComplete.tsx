import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle2,
  ChevronLeft,
  Pencil,
  QrCode,
  Share2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';

import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface StepOnboardingCompleteProps {
  onGoHome: () => void;
  onBack?: () => void;
  completionPercent?: number;
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
  onBack,
  completionPercent = 100,
  isSaving = false,
}: StepOnboardingCompleteProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const iconColor = isDark ? Colors.palette.brandCyanLight : Colors.palette.brandCyan;
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const successColor = isDark ? '#34d399' : '#059669';
  const clampedPercent = Math.min(100, Math.max(0, Math.round(completionPercent)));

  const gradientColors: [string, string, string] = isDark
    ? ['#020617', '#0a1128', '#0f172a']
    : ['#eef6ff', '#ffffff', '#f1f5f9'];

  const handlePress = () => {
    if (isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onGoHome();
  };

  const handleBack = () => {
    if (isSaving || !onBack) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
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
        className="flex-1 px-5"
        style={{
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <View className="w-full max-w-[440px] flex-1 self-center">
          <Animated.View
            entering={FadeIn.duration(360)}
            className="w-full flex-row items-center justify-between pt-2"
          >
            {onBack ? (
              <Pressable
                accessibilityLabel="Go back to previous step"
                accessibilityRole="button"
                disabled={isSaving}
                onPress={handleBack}
                className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100/90 active:opacity-75 dark:bg-dark-card/90"
              >
                <ChevronLeft
                  color={isDark ? Colors.dark.text : Colors.light.text}
                  size={22}
                  strokeWidth={2.4}
                />
              </Pressable>
            ) : (
              <View className="h-11 w-11" />
            )}
            <BrandLogo accessibilityLabel="VCPROS logo" size="xl" variant="wordmark" />
            <View className="h-11 w-11" />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).duration(380)}
            className="mt-5 w-full items-center"
          >
            <View
              className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(52,211,153,0.10)' : 'rgba(16,185,129,0.12)' }}
            >
              <View
                className="h-[52px] w-[52px] items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(52,211,153,0.18)' : 'rgba(16,185,129,0.18)' }}
              >
                <CheckCircle2 color={successColor} size={30} strokeWidth={2.2} />
              </View>
            </View>

            <Text
              variant="none"
              className="text-center text-[28px] font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
            >
              You&apos;re all set
            </Text>
            <Text
              variant="none"
              className="mt-2 max-w-[320px] text-center text-[15px] font-normal leading-[22px] text-slate-500 dark:text-slate-400"
            >
              Your professional card is ready. Here&apos;s what you can do next.
            </Text>
          </Animated.View>

          {/* Profile Completion Percentage Card */}
          <Animated.View
            entering={FadeInDown.delay(90).duration(380)}
            className="mt-5 w-full rounded-lg border border-transparent bg-slate-100/90 p-4 dark:bg-dark-card/90"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Sparkles size={16} color={tintColor} strokeWidth={2} />
                <Text
                  variant="none"
                  className="text-[14px] font-medium text-textPrimary dark:text-dark-textPrimary"
                >
                  Profile completion
                </Text>
              </View>
              <Text
                variant="none"
                style={{ color: tintColor }}
                className="text-[15px] font-semibold"
              >
                {clampedPercent}%
              </Text>
            </View>

            <View
              className="mt-2.5 h-2 w-full overflow-hidden rounded-full"
              style={{
                backgroundColor: isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.28)',
              }}
            >
              <View
                style={{
                  width: `${clampedPercent}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: tintColor,
                }}
              />
            </View>

            <Text
              variant="none"
              className="mt-2 text-[12px] font-normal text-slate-500 dark:text-slate-400"
            >
              {clampedPercent >= 100
                ? 'Your profile is 100% complete and ready to share!'
                : 'You can complete any remaining optional fields anytime in Profile.'}
            </Text>
          </Animated.View>

          {/* Next Steps Cards */}
          <Animated.View
            entering={FadeInDown.delay(120).duration(380)}
            className="mt-4 w-full gap-3"
          >
            {NEXT_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.id}
                  className="flex-row items-center gap-3.5 rounded-lg border border-transparent bg-slate-100/90 px-4 py-3.5 dark:bg-dark-card/90"
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-lg ${
                      isDark ? 'bg-sky-400/15' : 'bg-sky-500/10'
                    }`}
                  >
                    <Icon color={iconColor} size={19} strokeWidth={2} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      className="text-[16px] font-medium text-textPrimary dark:text-dark-textPrimary"
                    >
                      {item.title}
                    </Text>
                    <Text
                      variant="none"
                      className="mt-0.5 text-[14px] font-normal leading-5 text-slate-500 dark:text-slate-400"
                    >
                      {item.detail}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>

          <View className="flex-1" />

          {/* Bottom Full-Pill CTA Button in App Theme */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(380)}
            className="w-full items-center pt-4"
          >
            <LinearGradient
              colors={['#2563eb', '#0284c7', '#00a8e8']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaPill}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to homepage"
                disabled={isSaving}
                onPress={handlePress}
                className={`min-h-[54px] w-full flex-row items-center justify-center px-6 py-3.5 ${
                  isSaving ? 'opacity-50' : 'active:opacity-90'
                }`}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.palette.primaryWhite} size="small" />
                ) : (
                  <Text variant="none" className="text-[16px] font-semibold text-white">
                    Go to homepage
                  </Text>
                )}
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaPill: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
});
