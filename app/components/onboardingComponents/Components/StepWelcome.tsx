import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { ArrowRight, Clock3, CreditCard, QrCode, Sparkles, type LucideIcon } from 'lucide-react-native';

import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Text } from '@/components/uiComponents/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface StepWelcomeProps {
  onGetStarted: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}

const BENEFITS: { id: string; icon: LucideIcon; title: string; detail: string }[] = [
  {
    id: 'card',
    icon: CreditCard,
    title: 'Build your digital card',
    detail: 'Name, role, and contacts in one place',
  },
  {
    id: 'share',
    icon: QrCode,
    title: 'Share with a QR code',
    detail: 'People save your info in seconds',
  },
  {
    id: 'edit',
    icon: Sparkles,
    title: 'Update anytime',
    detail: 'Change look, links, and details later',
  },
];

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
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const ctaWidth = Math.min(Math.round(screenWidth * 0.88), 380);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const iconColor = isDark ? Colors.palette.brandCyanLight : Colors.palette.brandCyan;

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

      <View
        className="flex-1 px-6"
        style={{
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        {/* Brand + value prop stacked tightly — no flex-centered dead space */}
        <Animated.View entering={FadeIn.duration(400)} className="w-full items-center pt-2">
          <BrandLogo accessibilityLabel="VCPROS logo" size="xxl" variant="wordmark" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).duration(420)}
          className="mt-7 w-full items-center px-1"
        >
          <Text
            variant="none"
            className="text-center text-[34px] font-bold leading-[40px] tracking-tight text-textPrimary dark:text-dark-textPrimary"
          >
            Your card, ready fast
          </Text>
          <Text className="mt-2.5 max-w-[320px] text-center text-[15px] font-medium leading-[22px] text-slate-600 dark:text-slate-300">
            Set up your professional card in about a minute—then share it anytime.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(420)}
          className="mt-8 w-full gap-3"
        >
          {BENEFITS.map((item) => {
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
                  <Icon color={iconColor} size={22} strokeWidth={2.1} />
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

        {/* CTA pinned toward the bottom without stretching mid content */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(420)}
          className="w-full items-center pt-4"
        >
          <GetStartedButton onPress={handleGetStarted} isSaving={isSaving} width={ctaWidth} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
            disabled={isSaving}
            onPress={handleSkip}
            className={`mt-4 items-center py-2 ${isSaving ? 'opacity-50' : 'active:opacity-70'}`}
          >
            <Text className="text-[15px] font-medium text-slate-500 dark:text-slate-400">
              Skip for now
            </Text>
          </Pressable>

          <View className="mt-2 flex-row items-center justify-center gap-1.5">
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
