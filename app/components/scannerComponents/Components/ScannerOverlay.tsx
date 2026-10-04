import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MAX_FONT_SCALE } from '@/components/uiComponents/Text';

type ScannerOverlayProps = {
  isActive: boolean;
  isProcessing?: boolean;
  /**
   * Width ÷ height of a photo shown with contentFit="contain" under the overlay. The frame then covers
   * exactly the photo and the scan line sweeps all of it; without it a card-shaped guide is shown.
   */
  imageAspectRatio?: number;
  /** Distance of the hint from the bottom of the overlay; it sits under the frame when omitted. */
  hintBottom?: number;
};

/** Business-card proportions, used for the guide when no photo is shown. */
const CARD_ASPECT_RATIO = 1.58;

type Size = { width: number; height: number };

/** The rectangle a contain-fitted image occupies inside the container. */
function fitFrame(container: Size, aspectRatio: number): Size {
  const width = Math.min(container.width, container.height * aspectRatio);
  return { width, height: width / aspectRatio };
}

export function ScannerOverlay({ isActive, isProcessing = false, imageAspectRatio, hintBottom }: ScannerOverlayProps) {
  const [scanProgress] = useState(() => new Animated.Value(0));
  const [container, setContainer] = useState<Size | null>(null);

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setContainer((previous) => (previous?.width === width && previous.height === height ? previous : { width, height }));
  };

  const frame = container
    ? imageAspectRatio
      ? fitFrame(container, imageAspectRatio)
      : { width: container.width * 0.84, height: (container.width * 0.84) / CARD_ASPECT_RATIO }
    : null;

  useEffect(() => {
    if (!isActive && !isProcessing) {
      scanProgress.stopAnimation();
      scanProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanProgress, {
          toValue: 1,
          duration: isProcessing ? 1100 : 1900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanProgress, {
          toValue: 0,
          duration: isProcessing ? 1100 : 1900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isActive, isProcessing, scanProgress]);

  // The line sweeps from the top edge of the frame to the bottom edge.
  const travel = Math.max(0, (frame?.height ?? 0) - SCAN_LINE_HEIGHT);
  const scanLineStyle = {
    opacity: scanProgress.interpolate({ inputRange: [0, 0.06, 0.94, 1], outputRange: [0, 1, 1, 0] }),
    transform: [{ translateY: scanProgress.interpolate({ inputRange: [0, 1], outputRange: [0, travel] }) }],
  };

  return (
    <View style={styles.overlay} onLayout={onLayout}>
      <View
        style={[
          styles.frame,
          frame ?? styles.hidden,
          imageAspectRatio ? styles.photoFrame : null,
          isProcessing && styles.processingFrame,
        ]}
      >
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        {(isActive || isProcessing) && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
      </View>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.hint, hintBottom != null && { position: 'absolute', bottom: hintBottom }]}>
        {isProcessing ? 'Reading card details…' : 'Fit the whole card inside the guides'}
      </Text>
    </View>
  );
}

const SCAN_LINE_HEIGHT = 2;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2, 6, 23, 0.16)', pointerEvents: 'none' },
  frame: { borderRadius: 20, overflow: 'hidden', backgroundColor: 'transparent' },
  // The photo's own edges are the frame, so the corners sit flush with it.
  photoFrame: { borderRadius: 6 },
  hidden: { width: 0, height: 0 },
  processingFrame: { backgroundColor: 'rgba(37, 99, 235, 0.08)' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#FFFFFF' },
  topLeft: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 18 },
  topRight: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 18 },
  bottomLeft: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 18 },
  bottomRight: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 18 },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 0, height: SCAN_LINE_HEIGHT, borderRadius: 2, backgroundColor: Colors.palette.brandCyanLight, shadowColor: Colors.palette.brandCyan, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  hint: { color: '#FFFFFF', marginTop: 18, fontSize: 13, fontWeight: '600', backgroundColor: 'rgba(2, 6, 23, 0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, overflow: 'hidden' },
});
