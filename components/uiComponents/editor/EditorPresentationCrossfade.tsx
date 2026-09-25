import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useEditorAnimatedIndex } from './EditorAnimatedPresentationContext';

/** Sheet index at which compact ↔ expanded crossfade is centered (matches half-open vs full-open). */
const PRESENTATION_MIDPOINT = 0.5;
/** Narrow band keeps the swap feeling instant while avoiding a hard cut. */
const CROSSFADE_HALF_WIDTH = 0.06;

type EditorPresentationCrossfadeProps = {
  compact: ReactNode;
  expanded: ReactNode;
  compactHeight: number;
  expandedHeight: number;
};

export function EditorPresentationCrossfade({
  compact,
  expanded,
  compactHeight,
  expandedHeight,
}: EditorPresentationCrossfadeProps) {
  const animatedIndex = useEditorAnimatedIndex();

  const fadeStart = PRESENTATION_MIDPOINT - CROSSFADE_HALF_WIDTH;
  const fadeEnd = PRESENTATION_MIDPOINT + CROSSFADE_HALF_WIDTH;

  const containerStyle = useAnimatedStyle(() => {
    const index = animatedIndex.value < 0 ? 0 : animatedIndex.value;
    return {
      height: interpolate(index, [0, 1], [compactHeight, expandedHeight], Extrapolation.CLAMP),
    };
  });

  const compactStyle = useAnimatedStyle(() => {
    const index = animatedIndex.value < 0 ? 0 : animatedIndex.value;
    const opacity = interpolate(index, [fadeStart, fadeEnd], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(index, [fadeStart, fadeEnd], [1, 0.97], Extrapolation.CLAMP);
    const zIndex = index < PRESENTATION_MIDPOINT ? 2 : 0;
    return { opacity, transform: [{ scale }], zIndex };
  });

  const expandedStyle = useAnimatedStyle(() => {
    const index = animatedIndex.value < 0 ? 0 : animatedIndex.value;
    const opacity = interpolate(index, [fadeStart, fadeEnd], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(index, [fadeStart, fadeEnd], [0.97, 1], Extrapolation.CLAMP);
    const zIndex = index >= PRESENTATION_MIDPOINT ? 2 : 0;
    return { opacity, transform: [{ scale }], zIndex };
  });

  return (
    <Animated.View style={containerStyle}>
      <View className="relative w-full" style={{ minHeight: compactHeight }}>
        <Animated.View style={[compactStyle, { position: 'absolute', left: 0, right: 0, top: 0 }]}>
          {compact}
        </Animated.View>
        <Animated.View style={[expandedStyle, { position: 'absolute', left: 0, right: 0, top: 0 }]}>
          {expanded}
        </Animated.View>
      </View>
    </Animated.View>
  );
}
