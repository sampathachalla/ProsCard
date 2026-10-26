import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress: () => void;
  /** Optional visual summary shown before the chevron (e.g. a theme swatch). */
  accessory?: ReactNode;
};

/** A tappable row that opens a picker sheet (Layout, Card theme). */
export function EditorRow({ icon: Icon, label, value, onPress, accessory }: Props) {
  return (
    <Pressable
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      className="mb-3 min-h-[56px] flex-row items-center rounded-2xl border border-slate-200 bg-card px-4 active:opacity-80 dark:border-slate-800 dark:bg-dark-card"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-sky-950/40">
        <Icon color="#2563eb" size={18} strokeWidth={2.2} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-semibold">{label}</Text>
        <Text variant="tiny" numberOfLines={1}>
          {value}
        </Text>
      </View>
      {accessory}
      <ChevronRight color="#94a3b8" size={20} strokeWidth={2.2} />
    </Pressable>
  );
}
