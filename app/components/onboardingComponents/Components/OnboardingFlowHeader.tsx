import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
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
  const track = isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.35)';
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;
  const skipColor = isDark ? Colors.dark.text : Colors.light.text;

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
    <View className="bg-background px-5 pb-3 pt-1 dark:bg-dark-background">
      <View className="h-11 flex-row items-center justify-between">
        <View className="w-[72px] items-start justify-center">
          {canGoBack ? (
            <Pressable
              accessibilityLabel="Go back to previous step"
              accessibilityRole="button"
              disabled={isSaving}
              hitSlop={10}
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center active:opacity-70"
            >
              <ChevronLeft color={iconColor} size={28} strokeWidth={2.4} />
            </Pressable>
          ) : (
            <View className="h-10 w-10" />
          )}
        </View>

        <View className="min-w-0 flex-1 items-center justify-center px-2">
          <Text
            accessibilityLabel="ProsCard"
            accessibilityRole="header"
            numberOfLines={1}
            style={{
              color: iconColor,
              fontSize: 18,
              fontWeight: '700',
              letterSpacing: -0.3,
            }}
          >
            <Text style={{ color: tint, fontSize: 18, fontWeight: '700' }}>P</Text>
            ros
            <Text style={{ color: tint, fontSize: 18, fontWeight: '700' }}>C</Text>
            ard
          </Text>
        </View>

        <View className="w-[72px] items-end justify-center">
          {canSkip ? (
            <Pressable
              accessibilityLabel="Skip this step"
              accessibilityRole="button"
              disabled={isSaving}
              hitSlop={10}
              onPress={handleSkip}
              className="h-10 justify-center px-1 active:opacity-70"
            >
              <Text style={{ color: skipColor, fontSize: 16, fontWeight: '600' }}>Skip</Text>
            </Pressable>
          ) : (
            <View className="h-10 w-10" />
          )}
        </View>
      </View>

      {totalProgressSteps > 0 ? (
        <View className="mt-3 flex-row" style={{ gap: 6 }}>
          {Array.from({ length: totalProgressSteps }, (_, index) => {
            const isActive = index <= progressIndex;
            return (
              <View
                key={`progress-${index}`}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: isActive ? tint : track,
                }}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
