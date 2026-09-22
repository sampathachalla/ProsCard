import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type CardTapGestureProps = {
  children: ReactNode;
  containerClassName?: string;
  doubleTapMaxDuration?: number;
  enabled?: boolean;
  onDoubleTap: () => void;
  onSingleTap?: () => void;
};

export function CardTapGesture({
  children,
  containerClassName,
  doubleTapMaxDuration = 260,
  enabled = true,
  onDoubleTap,
  onSingleTap,
}: CardTapGestureProps) {
  const gesture = useMemo(() => {
    const doubleTap = Gesture.Tap()
      .enabled(enabled)
      .numberOfTaps(2)
      .maxDuration(doubleTapMaxDuration)
      .onEnd((_event, success) => {
        if (success) onDoubleTap();
      })
      .runOnJS(true);

    if (!onSingleTap) return doubleTap;

    const singleTap = Gesture.Tap()
      .enabled(enabled)
      .numberOfTaps(1)
      .onEnd((_event, success) => {
        if (success) onSingleTap();
      })
      .runOnJS(true);

    return Gesture.Exclusive(doubleTap, singleTap);
  }, [doubleTapMaxDuration, enabled, onDoubleTap, onSingleTap]);

  return (
    <GestureDetector gesture={gesture}>
      <View className={containerClassName}>{children}</View>
    </GestureDetector>
  );
}
