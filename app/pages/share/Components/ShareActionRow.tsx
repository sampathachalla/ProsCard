import React from 'react';
import { Pressable, View } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import { useThemeContext } from '@/context/ThemeContext';
import type { ShareActionItemConfig } from '../types/share.types';

export interface ShareActionRowProps {
  item: ShareActionItemConfig;
  isLast?: boolean;
  badgeText?: string;
  onPress: () => void;
}

export function ShareActionRow({
  item,
  isLast = false,
  badgeText,
  onPress,
}: ShareActionRowProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const Icon = item.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={onPress}
      className={`min-h-[54px] flex-row items-center justify-between px-4 py-3 active:bg-slate-200/60 dark:active:bg-slate-800/60 ${
        !isLast ? 'border-b border-slate-200/70 dark:border-slate-800/80' : ''
      }`}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3.5 pr-2">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200/75 dark:bg-slate-800/90">
          <Icon color={item.iconColor} size={18} strokeWidth={2.2} />
        </View>
        <Text
          variant="none"
          numberOfLines={1}
          className="flex-1 text-[16px] font-normal text-textPrimary dark:text-dark-textPrimary"
        >
          {item.label}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {badgeText ? (
          <View className="flex-row items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 dark:border-sky-400/30 dark:bg-sky-500/15">
            {badgeText === 'Copied!' ? (
              <Check size={12} color={isDark ? '#38bdf8' : '#2563eb'} strokeWidth={2.6} />
            ) : null}
            <Text
              variant="none"
              className="text-[12px] font-semibold text-primary dark:text-sky-400"
            >
              {badgeText}
            </Text>
          </View>
        ) : null}
        <ChevronRight
          size={18}
          color={isDark ? '#64748b' : '#94a3b8'}
          strokeWidth={2.2}
        />
      </View>
    </Pressable>
  );
}
