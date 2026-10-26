import { ActivityIndicator, Modal, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { QRCodeView } from './QRCodeView';
import { Text } from './Text';

export function QRCodeModal({ cardName, error, onClose, url, visible }: { cardName: string; error?: string; onClose: () => void; url: string; visible: boolean }) {
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
                  <Text className="mb-4 text-center text-xl font-bold text-white">{cardName}</Text>
                  <View className="items-center rounded-2xl border border-slate-700/80 bg-[#111827] px-6 pb-5 pt-6">
                    {url ? (
                      <QRCodeView
                        value={url}
                        size={224}
                        backgroundColor="#111827"
                        foregroundColor="#ffffff"
                        accentColor="#38bdf8"
                        framed={false}
                        showCenterLogo
                      />
                    ) : (
                      <View className="items-center justify-center" style={{ width: 224, height: 224 }}>
                        {error ? <Text className="text-center text-white">{error}</Text> : <ActivityIndicator color="#ffffff" />}
                      </View>
                    )}
                    <Text className="mt-4 text-[16px] font-medium text-white">
                      {url ? 'Scan to share card' : error ? 'Share link unavailable' : 'Preparing share link…'}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureDetector>
    </Modal>
  );
}
