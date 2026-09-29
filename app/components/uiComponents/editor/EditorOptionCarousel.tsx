import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

type EditorOptionCarouselProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  itemWidth: number;
  height: number;
  gap?: number;
  trailingPadding?: number;
};

export function EditorOptionCarousel<T>({
  items,
  keyExtractor,
  renderItem,
  itemWidth,
  height,
  gap = 12,
  trailingPadding = 24,
}: EditorOptionCarouselProps<T>) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      snapToAlignment="start"
      style={{ height }}
      contentContainerStyle={{ gap, paddingRight: trailingPadding }}
    >
      {items.map((item) => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
    </ScrollView>
  );
}
