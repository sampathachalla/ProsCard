import { ActivityIndicator, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronDown, Plus } from 'lucide-react-native';

import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

type HomeHeaderProps = {
  cardTag: string;
  addingCard?: boolean;
  addDisabled?: boolean;
  cardTagSelectable?: boolean;
  onAddCard: () => void;
  onCardTagPress?: () => void;
};

export function HomeHeader({
  cardTag,
  addingCard = false,
  addDisabled = false,
  cardTagSelectable = false,
  onAddCard,
  onCardTagPress,
}: HomeHeaderProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;

  const handleAdd = () => {
    if (addDisabled || addingCard) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAddCard();
  };

  return (
    <View className="flex-row items-center gap-2.5 px-5 pb-1.5 pt-1">
      <View className="shrink-0 items-center justify-center">
        <BrandLogo accessibilityLabel="VC Pros app logo" size="header" variant="icon" />
      </View>

      {/* Center: Card Category Selector / Pill (Matched 48px height) */}
      {cardTagSelectable && onCardTagPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Card tag ${cardTag}. Choose another card.`}
          onPress={onCardTagPress}
          className="h-12 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 px-2 active:opacity-75"
        >
          <Text
            numberOfLines={1}
            variant="none"
            className="text-center text-[16px] font-semibold text-textPrimary dark:text-dark-textPrimary"
          >
            {cardTag}
          </Text>
          <ChevronDown color={iconColor} size={18} strokeWidth={2.2} />
        </Pressable>
      ) : (
        <View className="h-12 min-w-0 flex-1 items-center justify-center px-2">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            variant="none"
            className="text-center text-[16px] font-semibold text-textPrimary dark:text-dark-textPrimary"
          >
            {cardTag}
          </Text>
        </View>
      )}

      {/* Right: 48x48 Add Card Button */}
      <Pressable
        accessibilityLabel="Add a new card"
        accessibilityRole="button"
        accessibilityState={{ busy: addingCard, disabled: addDisabled || addingCard }}
        disabled={addDisabled || addingCard}
        hitSlop={10}
        onPress={handleAdd}
        className="h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 active:opacity-75 dark:border-slate-800 dark:bg-dark-card"
      >
        {addingCard ? (
          <ActivityIndicator color={tint} size="small" />
        ) : (
          <Plus color={iconColor} size={22} strokeWidth={2.4} />
        )}
      </Pressable>
    </View>
  );
}
