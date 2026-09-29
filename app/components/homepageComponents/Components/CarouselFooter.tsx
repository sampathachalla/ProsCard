import { View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

type CarouselFooterProps = {
  activeIndex: number;
  count: number;
};

export function CarouselFooter({ activeIndex, count }: CarouselFooterProps) {
  if (count === 0) return null;

  return (
    <View className="items-center pb-1 pt-2">
      <Text
        accessibilityLabel={`Card ${activeIndex + 1} of ${count}`}
        variant="caption"
        className="rounded-full bg-slate-100 px-3 py-1 font-bold tabular-nums text-textMuted dark:bg-slate-800 dark:text-dark-textMuted"
      >
        {activeIndex + 1} / {count}
      </Text>
    </View>
  );
}

