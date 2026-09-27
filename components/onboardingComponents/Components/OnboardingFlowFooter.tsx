import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/uiComponents/Button';
import type { OnboardingFlowItem } from '../types/onboardingFlow.types';

export interface OnboardingFlowFooterProps {
  currentItem: OnboardingFlowItem;
  canSkip: boolean;
  isSaving: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

export function OnboardingFlowFooter({
  currentItem,
  canSkip,
  isSaving,
  onContinue,
  onSkip,
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

  const handleSkip = () => {
    if (!canSkip || isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSkip();
  };

  const primaryLabel = 'Continue';

  const onPrimary = handleContinue;

  return (
    <View
      className="border-t border-slate-200/80 bg-background px-6 pt-3 dark:border-slate-800/80 dark:bg-dark-background"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {canSkip ? (
        <View className="mb-2 items-center">
          <Button
            label="Skip for now"
            variant="ghost"
            size="md"
            disabled={isSaving}
            onPress={handleSkip}
            className="rounded-xl"
          />
        </View>
      ) : null}
      <Button
        label={isSaving ? 'Saving…' : primaryLabel}
        variant="primary"
        size="lg"
        loading={isSaving}
        disabled={isSaving}
        onPress={onPrimary}
        className="w-full rounded-xl"
      />
    </View>
  );
}
