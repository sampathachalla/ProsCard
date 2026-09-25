import { useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

/** A continuous, non-interactive app-brand focus frame for the active section. */
export function ActiveSectionHighlight() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedFrame = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [Colors.palette.primaryCta, Colors.palette.brandCyan, Colors.palette.brandCyanLight],
    );

    return {
      borderColor,
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.72, 1, 0.78]),
      shadowColor: borderColor,
      shadowOpacity: interpolate(progress.value, [0, 0.5, 1], [0.3, 0.75, 0.4]),
      shadowRadius: interpolate(progress.value, [0, 0.5, 1], [3, 8, 4]),
      transform: [{ scale: interpolate(progress.value, [0, 0.5, 1], [0.998, 1, 0.998]) }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 rounded-lg"
      style={[
        animatedFrame,
        {
          borderWidth: 2.5,
          elevation: 5,
          shadowOffset: { width: 0, height: 0 },
          zIndex: 20,
        },
      ]}
    />
  );
}
