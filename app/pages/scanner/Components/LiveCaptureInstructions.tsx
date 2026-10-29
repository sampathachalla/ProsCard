import { StyleSheet, Text, View } from 'react-native';
import { IdCard, ScanLine } from 'lucide-react-native';

import { MAX_FONT_SCALE } from '@/common/ui/Text';

type LiveCaptureInstructionsProps = {
  enabled: boolean;
  variant: 'card' | 'badge';
  bottom: number;
};

/** Compact guidance that leaves the camera center clear for native live edge detection. */
export function LiveCaptureInstructions({ enabled, variant, bottom }: LiveCaptureInstructionsProps) {
  if (!enabled) return null;

  const badge = variant === 'badge';
  const Icon = badge ? IdCard : ScanLine;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.pill}>
        <Icon color="#7DD3FC" size={18} strokeWidth={2} />
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.text} numberOfLines={2}>
          {badge
            ? 'Keep the full event badge visible with the name and company clear'
            : 'Keep the full business card visible — edges are detected automatically'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 28,
    right: 28,
    zIndex: 12,
    alignItems: 'center',
  },
  pill: {
    maxWidth: 390,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
  },
  text: {
    flexShrink: 1,
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
