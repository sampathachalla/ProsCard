import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

type EditorOptionGridProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, width: number) => ReactNode;
  gap?: number;
  /** Total width available for the grid row (defaults to window width minus horizontalPadding). */
  containerWidth?: number;
  horizontalPadding?: number;
  columns?: number;
  singleColumnBelowWidth?: number;
};

export function EditorOptionGrid<T>({
  items,
  keyExtractor,
  renderItem,
  gap = 12,
  containerWidth: containerWidthProp,
  horizontalPadding = 0,
  columns = 2,
  singleColumnBelowWidth = 320,
}: EditorOptionGridProps<T>) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = containerWidthProp ?? windowWidth - horizontalPadding;
  const columnCount =
    containerWidth < singleColumnBelowWidth ? 1 : Math.max(1, columns);
  const itemWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;

  return (
    <View className="flex-row flex-wrap" style={{ gap, width: containerWidth, alignSelf: 'center' }}>
      {items.map((item) => (
        <View key={keyExtractor(item)} style={{ width: itemWidth }}>
          {renderItem(item, itemWidth)}
        </View>
      ))}
    </View>
  );
}
