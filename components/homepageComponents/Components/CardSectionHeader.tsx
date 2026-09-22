import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronDown, GalleryHorizontal, Layers3 } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { IconButton } from '@/components/uiComponents/IconButton';
import { Text } from '@/components/uiComponents/Text';

export type CardViewMode = 'carousel' | 'stack';

type CardSectionHeaderProps = {
  category?: string;
  onCategoryPress?: () => void;
  onViewModeToggle: () => void;
  viewMode: CardViewMode;
};

export function CardSectionHeader({
  category = 'Professional',
  onCategoryPress,
  onViewModeToggle,
  viewMode,
}: CardSectionHeaderProps) {
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const handleCategoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onCategoryPress?.();
  };

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityLabel={`Card category: ${category}. Tap to switch category.`}
        accessibilityRole="button"
        className="mr-3 min-w-0 flex-1 flex-row items-center rounded-2xl py-1 active:scale-98 active:opacity-75"
        onPress={handleCategoryPress}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            variant="title"
            className="min-w-0 flex-shrink text-[28px] font-black leading-8 tracking-tight"
            style={{ fontSize: 28, fontWeight: '900', lineHeight: 32 }}
          >
            {category}
          </Text>
          <View className="flex-shrink-0 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <ChevronDown color={palette.tint} size={18} strokeWidth={2.5} />
          </View>
        </View>
      </Pressable>

      <IconButton
        accessibilityLabel={
          viewMode === 'carousel' ? 'Switch to stacked card view' : 'Switch to carousel card view'
        }
        icon={viewMode === 'carousel' ? Layers3 : GalleryHorizontal}
        iconSize={21}
        onPress={onViewModeToggle}
        size={44}
        variant="surface"
      />
    </View>
  );
}
