import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, X } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export interface OnboardingFlowHeaderProps {
  canGoBack: boolean;
  canSkip: boolean;
  isSaving: boolean;
  /** 0-based active progress step among group screens. */
  progressIndex: number;
  totalProgressSteps: number;
  onBack: () => void;
  onSkip: () => void;
}

export function OnboardingFlowHeader({
  canGoBack,
  canSkip,
  isSaving,
  progressIndex,
  totalProgressSteps,
  onBack,
  onSkip,
}: OnboardingFlowHeaderProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;
  const trackColor = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.32)';

  const stepCount = Math.max(0, totalProgressSteps);
  const activeStepIndex =
    stepCount > 0 ? Math.min(stepCount - 1, Math.max(0, progressIndex)) : 0;
  const stepNumber = stepCount > 0 ? activeStepIndex + 1 : 0;

  const handleBack = () => {
    if (!canGoBack || isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  const handleSkip = () => {
    if (!canSkip || isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSkip();
  };

  return (
    <View className="bg-background px-5 pb-4 pt-2.5 dark:bg-dark-background">
      <View className="w-full max-w-[440px] self-center">
        <View className="flex-row items-center gap-2.5">
          {canGoBack ? (
            <Pressable
              accessibilityLabel="Go back to previous step"
              accessibilityRole="button"
              disabled={isSaving}
              hitSlop={10}
              onPress={handleBack}
              className="h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 active:opacity-75 dark:border-slate-800 dark:bg-dark-card"
            >
              {progressIndex === 0 ? (
                <X color={iconColor} size={20} strokeWidth={2.4} />
              ) : (
                <ChevronLeft color={iconColor} size={22} strokeWidth={2.5} />
              )}
            </Pressable>
          ) : null}

          <View className="min-h-[44px] flex-1 justify-center gap-2">
            {stepCount > 0 ? (
              <>
                <Text
                  variant="none"
                  accessibilityLabel={`Step ${stepNumber} of ${stepCount}`}
                  className="text-[13px] font-semibold tabular-nums text-slate-600 dark:text-slate-300"
                >
                  {stepNumber}/{stepCount}
                </Text>
                <View
                  accessibilityLabel={`Step ${stepNumber} of ${stepCount}`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: stepCount,
                    now: stepNumber,
                  }}
                  className="flex-row items-center"
                  style={{ gap: 4 }}
                >
                  {Array.from({ length: stepCount }, (_, index) => {
                    const isReached = index <= activeStepIndex;
                    return (
                      <View
                        key={`segment-${index}`}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor: isReached ? tint : trackColor,
                        }}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}
          </View>

          {canSkip ? (
            <Pressable
              accessibilityLabel="Skip this step"
              accessibilityRole="button"
              disabled={isSaving}
              hitSlop={10}
              onPress={handleSkip}
              className="h-11 shrink-0 justify-center px-2 active:opacity-70"
            >
              <Text
                variant="none"
                className="text-[15px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Skip
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
