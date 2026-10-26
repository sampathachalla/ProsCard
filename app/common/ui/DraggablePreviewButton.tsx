import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';

type Point = { x: number; y: number };

type Props = {
  onPress: () => void;
  /** Extra space reserved above bottom navigation or other persistent chrome. */
  bottomOffset?: number;
};

const EDGE_GAP = 12;
const TOP_CHROME_HEIGHT = 64;
const DEFAULT_SIZE = { width: 52, height: 52 };

/** Floating preview control that can be dragged anywhere inside the safe viewport. */
export function DraggablePreviewButton({ onPress, bottomOffset = 16 }: Props) {
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState(DEFAULT_SIZE);
  const minimumY = insets.top + TOP_CHROME_HEIGHT;
  const maximumX = Math.max(EDGE_GAP, viewportWidth - size.width - EDGE_GAP);
  const maximumY = Math.max(
    minimumY,
    viewportHeight - size.height - Math.max(insets.bottom, bottomOffset) - EDGE_GAP,
  );

  const clamp = (point: Point): Point => ({
    x: Math.min(maximumX, Math.max(EDGE_GAP, point.x)),
    y: Math.min(maximumY, Math.max(minimumY, point.y)),
  });

  const initialPoint = clamp({
    x: viewportWidth - DEFAULT_SIZE.width - 18,
    y: viewportHeight * 0.62,
  });
  const position = useRef(new Animated.ValueXY(initialPoint)).current;
  const currentPoint = useRef(initialPoint);
  const dragStart = useRef(initialPoint);
  const latestBounds = useRef({ minimumY, maximumX, maximumY });
  const latestPress = useRef(onPress);
  latestPress.current = onPress;
  latestBounds.current = { minimumY, maximumX, maximumY };

  const clampToLatestBounds = useCallback((point: Point): Point => {
    const bounds = latestBounds.current;
    return {
      x: Math.min(bounds.maximumX, Math.max(EDGE_GAP, point.x)),
      y: Math.min(bounds.maximumY, Math.max(bounds.minimumY, point.y)),
    };
  }, []);

  const moveTo = useCallback((point: Point) => {
    const next = clampToLatestBounds(point);
    currentPoint.current = next;
    position.setValue(next);
  }, [clampToLatestBounds, position]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        dragStart.current = currentPoint.current;
      },
      onPanResponderMove: (_event, gesture) => {
        moveTo({
          x: dragStart.current.x + gesture.dx,
          y: dragStart.current.y + gesture.dy,
        });
      },
      onPanResponderRelease: (_event, gesture) => {
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          latestPress.current();
        }
      },
      onPanResponderTerminate: () => moveTo(currentPoint.current),
    }),
    [moveTo],
  );

  useEffect(() => {
    moveTo(currentPoint.current);
  }, [maximumX, maximumY, minimumY, moveTo]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextSize = event.nativeEvent.layout;
    if (nextSize.width !== size.width || nextSize.height !== size.height) {
      setSize({ width: nextSize.width, height: nextSize.height });
    }
  };

  if (AUTH_TEST_MODE) return null;

  return (
    <Animated.View
      accessible
      accessibilityHint="Double tap to preview. Drag to reposition."
      accessibilityLabel="Preview card"
      accessibilityRole="button"
      onAccessibilityTap={() => latestPress.current()}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      className="absolute z-50 overflow-hidden rounded-full border border-white/25 bg-slate-950/90"
      style={{
        elevation: 30,
        shadowColor: '#020617',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.28,
        shadowRadius: 9,
        transform: position.getTranslateTransform(),
      }}
    >
      <View className="h-[52px] w-[52px] items-center justify-center">
        <Eye color="#38bdf8" size={23} strokeWidth={2.4} />
      </View>
    </Animated.View>
  );
}
