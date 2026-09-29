import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CreditCard, ScanLine } from 'lucide-react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

type ScannerTopPanelProps = {
  stage: 'camera' | 'processing' | 'result';
  hasScanData: boolean;
};

export function ScannerTopPanel({ stage, hasScanData }: ScannerTopPanelProps) {
  const scanY = useSharedValue(0);
  const pulse = useSharedValue(0);
  const orbit = useSharedValue(0);

  useEffect(() => {
    scanY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: stage === 'processing' ? 900 : 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: stage === 'processing' ? 900 : 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1100, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );

    orbit.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.linear }), -1, false);
  }, [orbit, pulse, scanY, stage]);

  const scanLineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scanY.value, [0, 0.12, 0.88, 1], [0.2, 1, 1, 0.2]),
    transform: [{ translateY: interpolate(scanY.value, [0, 1], [-54, 54]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.85]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.08]) }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(orbit.value, [0, 1], [0, 360])}deg` }],
  }));

  const title =
    stage === 'processing'
      ? 'Reading your card'
      : stage === 'result'
        ? hasScanData
          ? 'Card detected'
          : 'Photo ready'
        : 'Scan a business card';

  const subtitle =
    stage === 'processing'
      ? 'Extracting contact details and links…'
      : stage === 'result'
        ? hasScanData
          ? 'ProsCard link found successfully'
          : 'Review the capture below, then continue'
        : 'Point the camera at a card or ProsCard QR';

  return (
    <View style={styles.panel}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.copy}>
        <Text style={styles.eyebrow}>
          {stage === 'processing' ? 'PROCESSING' : stage === 'result' ? 'SCAN COMPLETE' : 'SMART CARD SCAN'}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>

      <View style={styles.stage}>
        <Animated.View style={[styles.orbitRing, orbitStyle]}>
          <View style={styles.orbitDot} />
        </Animated.View>

        <Animated.View style={[styles.pulseRing, ringStyle]} />

        <View style={styles.cardFrame}>
          <CreditCard
            color={stage === 'processing' ? Colors.palette.brandCyanLight : '#E2E8F0'}
            size={34}
            strokeWidth={1.8}
          />
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        </View>

        {stage === 'processing' && (
          <Animated.View entering={FadeIn.delay(120)} style={styles.processingBadge}>
            <ScanLine color={Colors.palette.brandCyanLight} size={16} />
            <Text style={styles.processingBadgeText}>Analyzing image</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: Colors.palette.midnightBase,
    paddingHorizontal: 24,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  copy: {
    alignItems: 'center',
    paddingTop: 8,
  },
  eyebrow: {
    color: Colors.palette.brandCyanLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    backgroundColor: Colors.palette.brandCyanLight,
  },
  pulseRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1.5,
    borderColor: 'rgba(56,189,248,0.35)',
    backgroundColor: 'rgba(56,189,248,0.06)',
  },
  cardFrame: {
    width: 118,
    height: 76,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.palette.brandCyanLight,
    shadowColor: Colors.palette.brandCyan,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  processingBadge: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
  },
  processingBadgeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
