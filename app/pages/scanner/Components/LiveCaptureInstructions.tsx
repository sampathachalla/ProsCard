import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import {
  BADGE_CAPTURE_TIPS,
  CAPTURE_TIPS,
  CaptureTipCaption,
  CaptureTipIcon,
  useCaptureTipCycle,
} from './CaptureTips';

type LiveCaptureInstructionsProps = {
  enabled: boolean;
  variant: 'card' | 'badge';
  bottom: number;
};

/** Cycling tips and icon animation over the live camera preview. */
export function LiveCaptureInstructions({ enabled, variant, bottom }: LiveCaptureInstructionsProps) {
  const tipsList = variant === 'badge' ? BADGE_CAPTURE_TIPS : CAPTURE_TIPS;
  const tips = useCaptureTipCycle(enabled, tipsList);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!enabled) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [enabled, pulse]);

  const iconRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!enabled) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      pointerEvents="box-none"
      style={[styles.wrap, { bottom }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.panel}>
        <Animated.View style={[styles.iconRing, iconRingStyle]}>
          <CaptureTipIcon tip={tips.tip} size={28} />
        </Animated.View>
        <CaptureTipCaption index={tips.index} onSelect={tips.select} tips={tipsList} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 12,
  },
  panel: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.22)',
  },
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    shadowColor: Colors.palette.brandCyan,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
