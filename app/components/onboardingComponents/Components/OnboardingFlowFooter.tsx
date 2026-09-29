import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/uiComponents/Button';
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
      className="bg-background px-6 pt-2 dark:bg-dark-background"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <Button
        label={isSaving ? 'Saving…' : 'Continue'}
        variant="primary"
        size="lg"
        loading={isSaving}
        disabled={isSaving}
        onPress={handleContinue}
        className="w-full rounded-xl"
      />
    </View>
  );
}
