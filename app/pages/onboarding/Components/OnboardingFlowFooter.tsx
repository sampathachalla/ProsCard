import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import type { OnboardingFlowItem } from '../types/onboardingFlow.types';

export interface OnboardingFlowFooterProps {
  currentItem: OnboardingFlowItem;
  isSaving: boolean;
  onContinue: () => void;
}

export function OnboardingFlowFooter({
  currentItem,
  isSaving,
  onContinue,
}: OnboardingFlowFooterProps) {
  const insets = useSafeAreaInsets();

  if (currentItem.kind === 'welcome' || currentItem.kind === 'complete') {
    return null;
  }

  const handleContinue = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onContinue();
  };

  return (
    <View
      className="bg-background px-5 pt-3 dark:bg-dark-background"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <LinearGradient
        colors={['#2563eb', '#0284c7', '#00a8e8']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.ctaPill}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaving ? 'Saving…' : 'Continue'}
          disabled={isSaving}
          onPress={handleContinue}
          className={`min-h-[54px] w-full flex-row items-center justify-center gap-2 px-6 py-3.5 ${
            isSaving ? 'opacity-50' : 'active:opacity-90'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.palette.primaryWhite} size="small" />
          ) : (
            <>
              <Text variant="none" className="text-[16px] font-semibold text-white">
                Continue
              </Text>
              <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} />
            </>
          )}
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaPill: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
});
