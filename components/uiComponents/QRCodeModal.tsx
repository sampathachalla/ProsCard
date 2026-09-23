import { Modal, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { QRCodeView } from './QRCodeView';
import { Text } from './Text';

export function QRCodeModal({ cardName, onClose, url, visible }: { cardName: string; onClose: () => void; url: string; visible: boolean }) {
  const translateY = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const dismissWithHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onClose(); };
  const swipe = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-14)
    .failOffsetX([-96, 96])
    .shouldCancelWhenOutside(false)
    .onUpdate((event) => {
      translateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      const projectedDistance = event.translationY + Math.max(0, event.velocityY) * 0.08;
      if (event.translationY >= 28 && projectedDistance >= 52) {
        translateY.set(0);
        runOnJS(dismissWithHaptic)();
      } else {
        translateY.set(withSpring(0));
      }
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((_event, success) => {
      if (success) runOnJS(dismissWithHaptic)();
    });
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={dismissWithHaptic}>
      <GestureDetector gesture={doubleTap}>
        <View
          accessibilityHint="Double tap anywhere to close the QR code"
          accessibilityLabel={`${cardName} QR code`}
          className="flex-1 items-center justify-center bg-slate-950/70 px-7"
        >
          <GestureDetector gesture={swipe}>
            <Animated.View className="w-full max-w-sm" style={style}>
              <BlurView intensity={45} tint="dark" className="overflow-hidden rounded-[32px] border border-white/20">
                <View className="items-center p-6">
                  <Text className="mb-5 text-center text-xl font-black text-white">{cardName}</Text>
                  <View className="rounded-[24px] bg-white p-4">
                    <QRCodeView value={url} size={220} backgroundColor="#ffffff" foregroundColor="#0f172a" />
                  </View>
                  <Text className="mt-4 font-semibold text-white/80">Scan to connect</Text>
                </View>
              </BlurView>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureDetector>
    </Modal>
  );
}
