import { Pressable, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import type { CardSectionId } from '@/pages/cards/types/card.types';
import { SECTION_CHOICES, SECTION_TITLES } from '../editViewConstants';

type Props = {
  activeSection: CardSectionId;
  expanded: boolean;
  onPress: () => void;
};

/** "Card section" selector at the top of the editor sheet; opens the section picker. */
export function SectionPickerButton({ activeSection, expanded, onPress }: Props) {
  const selected = SECTION_CHOICES.find(({ id }) => id === activeSection) ?? SECTION_CHOICES[0];
  const SelectedIcon = selected.icon;
  return (
    <Pressable
      accessibilityLabel={`Select card section. Current section: ${SECTION_TITLES[activeSection]}`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-card px-4 py-3 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
      onPress={onPress}
    >
      <View className="size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
        <SelectedIcon color="#3b82f6" size={20} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">Card section</Text>
        <Text className="mt-0.5 text-base font-bold text-textPrimary dark:text-dark-textPrimary">{selected.title}</Text>
      </View>
      <ChevronDown color="#64748b" size={20} />
    </Pressable>
  );
}
