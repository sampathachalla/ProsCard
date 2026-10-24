import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

export type CardTapGestureProps = {
  children: ReactNode;
  containerClassName?: string;
  doubleTapMaxDuration?: number;
  enabled?: boolean;
  hapticsEnabled?: boolean;
  simultaneousWithNative?: boolean;
  onDoubleTap: () => void;
  onSwipeDown?: () => void;
  onSingleTap?: () => void;
};

export function CardTapGesture({
  children,
  containerClassName,
  doubleTapMaxDuration = 260,
  enabled = true,
  hapticsEnabled = true,
  simultaneousWithNative = false,
  onDoubleTap,
  onSwipeDown,
  onSingleTap,
}: CardTapGestureProps) {
  const gesture = useMemo(() => {
    const doubleTap = Gesture.Tap()
      .enabled(enabled)
      .numberOfTaps(2)
      .maxDuration(doubleTapMaxDuration)
      .onEnd((_event, success) => {
        if (success) {
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onDoubleTap();
        }
      })
      .runOnJS(true);

    const swipeDown = onSwipeDown
      ? Gesture.Pan()
          .enabled(enabled)
          .activeOffsetY(10)
          .failOffsetY(-14)
          .failOffsetX([-96, 96])
          .minPointers(1)
          .maxPointers(1)
          .shouldCancelWhenOutside(false)
          .onEnd((event, success) => {
            const projectedDistance = event.translationY + Math.max(0, event.velocityY) * 0.08;
            if (success && event.translationY >= 28 && projectedDistance >= 52) {
              if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              onSwipeDown();
            }
          })
          .runOnJS(true)
      : null;

    if (!onSingleTap) {
      const interaction = swipeDown ? Gesture.Race(swipeDown, doubleTap) : doubleTap;
      return simultaneousWithNative
        ? Gesture.Simultaneous(Gesture.Native(), interaction)
        : interaction;
    }

    const singleTap = Gesture.Tap()
      .enabled(enabled)
      .numberOfTaps(1)
      .onEnd((_event, success) => {
        if (success) {
          if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
          onSingleTap();
        }
      })
      .runOnJS(true);

    const taps = Gesture.Exclusive(doubleTap, singleTap);
    const interaction = swipeDown ? Gesture.Race(swipeDown, taps) : taps;
    return simultaneousWithNative
      ? Gesture.Simultaneous(Gesture.Native(), interaction)
      : interaction;
  }, [doubleTapMaxDuration, enabled, hapticsEnabled, onDoubleTap, onSingleTap, onSwipeDown, simultaneousWithNative]);

  return (
    <GestureDetector gesture={gesture}>
      <View className={containerClassName}>{children}</View>
    </GestureDetector>
  );
}
