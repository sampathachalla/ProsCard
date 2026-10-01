// components/contactsComponents/Components/CardImageViewer.tsx
import { Modal, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { MediaImage } from '@/components/uiComponents/MediaImage';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

type CardImageViewerProps = {
  visible: boolean;
  onClose: () => void;
  /** A photo on the device (new scan). */
  localUri?: string;
  /** A photo stored on the backend. */
  storedUrl?: string;
};

/** Full-screen card photo: pinch to zoom, drag while zoomed, double-tap to zoom in or out. */
export function CardImageViewer({ visible, onClose, localUri, storedUrl }: CardImageViewerProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reset = () => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  };

  const close = () => {
    reset();
    onClose();
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedX.value = 0;
        savedY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const zoomIn = scale.value <= 1;
      scale.value = withTiming(zoomIn ? DOUBLE_TAP_SCALE : 1);
      savedScale.value = zoomIn ? DOUBLE_TAP_SCALE : 1;
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedX.value = 0;
      savedY.value = 0;
    });

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const frame = { width, height: height - insets.top - insets.bottom };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={close}>
      {/* A modal renders outside the app's gesture root, so it needs its own. */}
      <GestureHandlerRootView style={styles.backdrop}>
        <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
          <Animated.View style={[{ marginTop: insets.top }, frame, imageStyle]}>
            {localUri ? (
              <Image source={{ uri: localUri }} style={frame} contentFit="contain" />
            ) : storedUrl ? (
              <MediaImage sourceUrl={storedUrl} style={frame} contentFit="contain" accessibilityLabel="Business card" />
            ) : null}
          </Animated.View>
        </GestureDetector>
        <View style={[styles.closeWrap, { top: insets.top + 8 }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close photo" hitSlop={10} onPress={close} style={styles.close}>
            <X color="#FFFFFF" size={22} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000' },
  closeWrap: { position: 'absolute', right: 16 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
