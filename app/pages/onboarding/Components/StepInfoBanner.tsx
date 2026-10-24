import React from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface StepInfoBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Quiet informational header used on each onboarding step. */
export function StepInfoBanner({ icon: Icon, title, description }: StepInfoBannerProps) {
  return (
    <View className="mb-6 flex-row items-start rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <Icon
        size={20}
        className="mr-3 mt-0.5 shrink-0 text-primary dark:text-dark-primary"
      />
      <View className="flex-1">
        <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
          {title}
        </Text>
        <Text className="mt-0.5 text-xs leading-4 text-textMuted dark:text-dark-textMuted">
          {description}
        </Text>
      </View>
    </View>
  );
}
