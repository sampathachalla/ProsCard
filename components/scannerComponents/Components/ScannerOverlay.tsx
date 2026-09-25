import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

type ScannerOverlayProps = {
  isActive: boolean;
  isProcessing?: boolean;
};

export function ScannerOverlay({ isActive, isProcessing = false }: ScannerOverlayProps) {
  const scanProgress = useRef(new Animated.Value(0)).current;

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

  const scanLineStyle = {
    opacity: scanProgress.interpolate({ inputRange: [0, 0.12, 0.88, 1], outputRange: [0, 1, 1, 0] }),
    transform: [{ translateY: scanProgress.interpolate({ inputRange: [0, 1], outputRange: [-82, 82] }) }],
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={[styles.frame, isProcessing && styles.processingFrame]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        {(isActive || isProcessing) && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
      </View>
      <Text style={styles.hint}>
        {isProcessing ? 'Reading card details…' : 'Fit the whole card inside the guides'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2, 6, 23, 0.16)' },
  frame: { width: '84%', aspectRatio: 1.58, borderRadius: 20, overflow: 'hidden', backgroundColor: 'transparent' },
  processingFrame: { backgroundColor: 'rgba(37, 99, 235, 0.08)' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#FFFFFF' },
  topLeft: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 18 },
  topRight: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 18 },
  bottomLeft: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 18 },
  bottomRight: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 18 },
  scanLine: { position: 'absolute', left: 12, right: 12, top: '50%', height: 2, borderRadius: 2, backgroundColor: Colors.palette.brandCyanLight, shadowColor: Colors.palette.brandCyan, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  hint: { color: '#FFFFFF', marginTop: 18, fontSize: 13, fontWeight: '600', backgroundColor: 'rgba(2, 6, 23, 0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, overflow: 'hidden' },
});
