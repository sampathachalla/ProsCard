// components/scannerComponents/Components/CaptureTips.tsx
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Contrast, QrCode, Scan, Smartphone, Sun, type LucideIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

export type CaptureTip = { id: string; icon: LucideIcon; text: string };

/** How to photograph a business card so the scanner can find its edges. */
export const CAPTURE_TIPS: CaptureTip[] = [
  { id: 'light', icon: Sun, text: 'Use bright, even light and avoid glare' },
  { id: 'surface', icon: Contrast, text: 'Place the card on a plain, contrasting surface' },
  { id: 'angle', icon: Smartphone, text: 'Hold your phone flat, directly above the card' },
  { id: 'corners', icon: Scan, text: 'Keep all four corners in view, then tap the shutter' },
  { id: 'qr', icon: QrCode, text: 'Got a ProsCard QR? Just point the camera at it' },
];

/** Steps through the tips on a timer while `enabled`; `select` jumps to one and restarts the timer. */
export function useCaptureTipCycle(enabled: boolean, intervalMs = 2800) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % CAPTURE_TIPS.length), intervalMs);
    return () => clearInterval(timer);
  }, [enabled, index, intervalMs]);

  return { index, tip: CAPTURE_TIPS[index]!, select: setIndex };
}

/** The tip's icon, cross-fading whenever the tip changes. */
export function CaptureTipIcon({ tip, size = 34, color = Colors.palette.brandCyanLight }: { tip: CaptureTip; size?: number; color?: string }) {
  const Icon = tip.icon;
  return (
    <Animated.View key={tip.id} entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)} style={styles.iconSlot}>
      <Icon color={color} size={size} strokeWidth={1.8} />
    </Animated.View>
  );
}

/** One-line tip text with step dots; tapping a dot shows that tip. */
export function CaptureTipCaption({ index, onSelect }: { index: number; onSelect?: (index: number) => void }) {
  const tip = CAPTURE_TIPS[index]!;
  return (
    <View style={styles.caption}>
      <View style={styles.textSlot}>
        <Animated.Text
          key={tip.id}
          entering={FadeInDown.duration(260)}
          exiting={FadeOutUp.duration(160)}
          style={styles.text}
          numberOfLines={2}
          accessibilityLiveRegion="polite"
        >
          {tip.text}
        </Animated.Text>
      </View>
      <View style={styles.dots}>
        {CAPTURE_TIPS.map((item, dotIndex) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Tip ${dotIndex + 1} of ${CAPTURE_TIPS.length}`}
            hitSlop={8}
            onPress={() => onSelect?.(dotIndex)}
            style={[styles.dot, dotIndex === index && styles.dotActive]}
          />
        ))}
      </View>
      <Text style={styles.step}>{`TIP ${index + 1} OF ${CAPTURE_TIPS.length}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconSlot: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    alignItems: 'center',
    gap: 8,
  },
  textSlot: {
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  text: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(148,163,184,0.35)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.palette.brandCyanLight,
  },
  step: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
