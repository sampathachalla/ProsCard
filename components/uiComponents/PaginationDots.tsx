import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

type PaginationDotsProps = {
  count: number;
  progress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
};

function PaginationDot({
  index,
  progress,
  activeColor,
  inactiveColor,
}: Omit<PaginationDotsProps, 'count'> & {
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    return {
      width: interpolate(distance, [0, 1], [22, 7], 'clamp'),
      backgroundColor: interpolateColor(distance, [0, 1], [activeColor, inactiveColor]),
      opacity: interpolate(distance, [0, 1], [1, 0.6], 'clamp'),
      transform: [
        {
          scale: interpolate(distance, [0, 1], [1, 0.9], 'clamp'),
        },
      ],
    };
  });

  return <Animated.View className="h-2 rounded-full" style={animatedStyle} />;
}

export function PaginationDots({
  count,
  progress,
  activeColor,
  inactiveColor,
}: PaginationDotsProps) {
  if (count <= 1) return null;

  return (
    <View
      accessibilityLabel={`Card carousel with ${count} pages`}
      pointerEvents="none"
      className="flex-row items-center justify-center gap-1.5 py-1"
    >
      {Array.from({ length: count }, (_, index) => (
        <PaginationDot
          key={index}
          index={index}
          progress={progress}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
      ))}
    </View>
  );
}
