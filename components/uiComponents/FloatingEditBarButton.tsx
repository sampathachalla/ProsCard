import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PanelBottomClose, PanelBottomOpen } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const BUTTON_SIZE = 52;
const EDGE_GAP = 12;

export function FloatingEditBarButton({
  barOpen,
  bottomInset = EDGE_GAP,
  minY = EDGE_GAP,
  onToggle,
  visible = true,
}: {
  barOpen: boolean;
  bottomInset?: number;
  minY?: number;
  onToggle: () => void;
  visible?: boolean;
}) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [bounds, setBounds] = useState({ height: 0, width: 0 });
  const x = useSharedValue(Math.max(EDGE_GAP, windowWidth - BUTTON_SIZE - EDGE_GAP));
  const y = useSharedValue(
    Math.max(minY, windowHeight - bottomInset - BUTTON_SIZE - EDGE_GAP),
  );
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const visibility = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    visibility.set(withTiming(visible ? 1 : 0, { duration: 320 }));
  }, [visibility, visible]);

  useEffect(() => {
    const visibleWidth = Math.min(bounds.width || windowWidth, windowWidth);
    const visibleHeight = Math.min(bounds.height || windowHeight, windowHeight);
    const maxX = Math.max(EDGE_GAP, visibleWidth - BUTTON_SIZE - EDGE_GAP);
    const maxY = Math.max(minY, visibleHeight - bottomInset - BUTTON_SIZE - EDGE_GAP);
    x.set(Math.min(maxX, Math.max(EDGE_GAP, x.get())));
    y.set(Math.min(maxY, Math.max(minY, y.get())));
  }, [bottomInset, bounds.height, bounds.width, minY, windowHeight, windowWidth, x, y]);

  const dragGesture = Gesture.Pan()
    .enabled(visible)
    .minDistance(6)
    .onBegin(() => {
      startX.set(x.get());
      startY.set(y.get());
    })
    .onUpdate((event) => {
      const visibleWidth = Math.min(bounds.width || windowWidth, windowWidth);
      const visibleHeight = Math.min(bounds.height || windowHeight, windowHeight);
      const maxX = Math.max(EDGE_GAP, visibleWidth - BUTTON_SIZE - EDGE_GAP);
      const maxY = Math.max(minY, visibleHeight - bottomInset - BUTTON_SIZE - EDGE_GAP);
      x.set(Math.min(maxX, Math.max(EDGE_GAP, startX.get() + event.translationX)));
      y.set(Math.min(maxY, Math.max(minY, startY.get() + event.translationY)));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.get(),
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      { scale: 0.9 + visibility.get() * 0.1 },
    ],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setBounds({ height, width });
  };

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggle();
  };

  const Icon = barOpen ? PanelBottomClose : PanelBottomOpen;

  return (
    <View
      onLayout={handleLayout}
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { elevation: 100, zIndex: 100 }]}
    >
      <GestureDetector gesture={dragGesture}>
        <Animated.View
          entering={FadeIn.duration(520)}
          className="absolute left-0 top-0"
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            { elevation: 101, height: BUTTON_SIZE, width: BUTTON_SIZE, zIndex: 101 },
            animatedStyle,
          ]}
        >
          <Pressable
            accessibilityLabel={`${barOpen ? 'Hide' : 'Show'} edit bar. Drag to reposition.`}
            accessibilityRole="button"
            className="h-[52px] w-[52px] items-center justify-center rounded-full border border-white/30 bg-primary shadow-lg shadow-black/30 active:opacity-80 dark:bg-dark-primary"
            onPress={toggle}
          >
            <Icon color="#ffffff" size={22} strokeWidth={2.4} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
