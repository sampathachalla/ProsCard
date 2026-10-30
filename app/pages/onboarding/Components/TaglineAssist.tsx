import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/common/ui/Text';
import type { ProfileCopyAssist } from '../types/onboardingStepper.types';

type Props = {
  assist: ProfileCopyAssist;
};

/**
 * On the headline step, shown only while the tagline and bio are being written from the user's focus;
 * the written text lands straight in the fields below, where it can be edited.
 */
export function TaglineAssist({ assist }: Props) {
  if (!assist.generating) return null;
  return (
    <View className="mb-5 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-4 dark:border-slate-800 dark:bg-dark-card">
      <ActivityIndicator size="small" color="#38bdf8" />
      <Text variant="none" className="flex-1 text-[14px] text-slate-600 dark:text-slate-300">
        Writing your headline and bio from your answers…
      </Text>
    </View>
  );
}
