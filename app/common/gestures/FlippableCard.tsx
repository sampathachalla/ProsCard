import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CardTapGesture } from './CardTapGesture';

export type FlippableCardProps = {
  accessibilityLabel: string;
  back: ReactNode;
  flipDuration?: number;
  flipEnabled?: boolean;
  front: ReactNode;
  hapticsEnabled?: boolean;
  height: number;
  onDoubleTap: () => void;
  onSwipeDown?: () => void;
  onSingleTapWhenDisabled?: () => void;
  perspective?: number;
  resetDuration?: number;
  width: number;
};

export function FlippableCard({
  accessibilityLabel,
  back,
  flipDuration = 420,
  flipEnabled = true,
  front,
  hapticsEnabled = true,
  height,
  onDoubleTap,
  onSwipeDown,
  onSingleTapWhenDisabled,
  perspective = 1000,
  resetDuration = 240,
  width,
}: FlippableCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!flipEnabled) progress.set(withTiming(0, { duration: resetDuration }));
  }, [flipEnabled, progress, resetDuration]);

  const frontStyle = useAnimatedStyle(() => ({
    backfaceVisibility: 'hidden',
    transform: [
      { perspective },
      { rotateY: `${interpolate(progress.get(), [0, 1], [0, 180])}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    backfaceVisibility: 'hidden',
    transform: [
      { perspective },
      { rotateY: `${interpolate(progress.get(), [0, 1], [180, 360])}deg` },
    ],
  }));

  const handleSingleTap = () => {
    if (!flipEnabled) {
      onSingleTapWhenDisabled?.();
      return;
    }

    progress.set(withTiming(progress.get() >= 0.5 ? 0 : 1, { duration: flipDuration }));
  };

  return (
    <CardTapGesture hapticsEnabled={hapticsEnabled} onDoubleTap={onDoubleTap} onSingleTap={handleSingleTap} onSwipeDown={onSwipeDown}>
      <View
        accessibilityLabel={`${accessibilityLabel}. ${
          flipEnabled ? 'Single tap to flip.' : 'Single tap to focus.'
        } Double tap to open details.${onSwipeDown ? ' Swipe down to show the QR code.' : ''}`}
        accessibilityRole="button"
        style={{ height, width }}
      >
        <Animated.View className="absolute inset-0" style={frontStyle}>
          {front}
        </Animated.View>
        <Animated.View className="absolute inset-0" style={backStyle}>
          {back}
        </Animated.View>
      </View>
    </CardTapGesture>
  );
}
