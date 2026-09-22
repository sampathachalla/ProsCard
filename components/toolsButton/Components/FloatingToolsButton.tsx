import { useEffect, useMemo, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Wrench } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/components/uiComponents/Text';
import { useFloatingTools } from '../Hooks/useFloatingTools';
import type { FloatingToolAction } from '../types';
import {
  clamp,
  FLOATING_TOOL_EDGE_GAP,
  FLOATING_TOOL_SIZE,
  toNormalizedPosition,
  toScreenPosition,
} from '../Utils/toolPosition';

type FloatingToolsButtonProps = {
  actions: FloatingToolAction[];
};

const TOOL_OPTION_HEIGHT = 48;
const TOOL_OPTION_WIDTH = 132;
const TOOL_ARC_RADIUS = 118;
const TOOL_SELECTION_THRESHOLD = 30;

type ArcDirection = 'down' | 'left' | 'right' | 'up';

function getArcDirection(position: { x: number; y: number }): ArcDirection {
  if (position.y <= 0.25) return 'down';
  if (position.y >= 0.75) return 'up';
  if (position.x <= 0.25) return 'right';
  if (position.x >= 0.75) return 'left';
  return position.y > 0.5 ? 'up' : 'down';
}

function getArcAngles(direction: ArcDirection) {
  switch (direction) {
    case 'right':
      return [-65, 65];
    case 'left':
      return [115, 245];
    case 'up':
      return [200, 340];
    case 'down':
      return [20, 160];
  }
}

function getArcTargets(direction: ArcDirection, count: number) {
  const [start, end] = getArcAngles(direction);
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const angle = ((start + (end - start) * progress) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * TOOL_ARC_RADIUS,
      y: Math.sin(angle) * TOOL_ARC_RADIUS,
    };
  });
}

export function FloatingToolsButton({ actions }: FloatingToolsButtonProps) {
  const { theme } = useThemeContext();
  const { enabled, enabledTools, hydrated, position, setPosition } = useFloatingTools();
  const [bounds, setBounds] = useState({ height: 0, width: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const palette = theme === 'dark' ? Colors.dark : Colors.light;
  const visibleActions = useMemo(
    () => actions.filter((action) => enabledTools.includes(action.id)),
    [actions, enabledTools],
  );
  const arcDirection = getArcDirection(position);
  const arcTargets = useMemo(
    () => getArcTargets(arcDirection, visibleActions.length),
    [arcDirection, visibleActions.length],
  );

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;
    const next = toScreenPosition(position, bounds.width, bounds.height);
    x.set(withSpring(next.x, { damping: 20, stiffness: 220 }));
    y.set(withSpring(next.y, { damping: 20, stiffness: 220 }));
  }, [bounds.height, bounds.width, position, x, y]);

  const savePosition = (nextX: number, nextY: number) => {
    setPosition(toNormalizedPosition(nextX, nextY, bounds.width, bounds.height));
  };

  const getSelectionIndex = (translationX: number, translationY: number) => {
    if (Math.hypot(translationX, translationY) < TOOL_SELECTION_THRESHOLD) return -1;

    let nearestIndex = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;
    arcTargets.forEach((target, index) => {
      const distance = Math.hypot(translationX - target.x, translationY - target.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  };

  const updateSelection = (index: number) => {
    if (selectedIndex === index) return;
    setSelectedIndex(index);
    if (index >= 0) Haptics.selectionAsync().catch(() => {});
  };

  const closeMenu = () => {
    setSelectedIndex(-1);
    setMenuOpen(false);
  };

  const executeAction = (index: number) => {
    const action = visibleActions[index];
    closeMenu();
    if (!action) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void action.onSelect();
  };

  const moveGesture = Gesture.Pan()
    .enabled(enabled && hydrated && !menuOpen)
    .minDistance(8)
    .onBegin(() => {
      startX.set(x.get());
      startY.set(y.get());
    })
    .onUpdate((event) => {
      const maxX = bounds.width - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP;
      const maxY = bounds.height - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP;
      x.set(clamp(startX.get() + event.translationX, FLOATING_TOOL_EDGE_GAP, maxX));
      y.set(clamp(startY.get() + event.translationY, FLOATING_TOOL_EDGE_GAP, maxY));
    })
    .onEnd(() => {
      savePosition(x.get(), y.get());
    })
    .runOnJS(true);

  const selectionGesture = Gesture.Pan()
    .enabled(enabled && hydrated && visibleActions.length > 0)
    .activateAfterLongPress(350)
    .onStart(() => {
      setMenuOpen(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    })
    .onUpdate((event) => {
      updateSelection(getSelectionIndex(event.translationX, event.translationY));
    })
    .onEnd((event) => {
      const index = getSelectionIndex(event.translationX, event.translationY);
      if (index >= 0) executeAction(index);
      else closeMenu();
    })
    .onFinalize(() => {
      closeMenu();
    })
    .runOnJS(true);

  const composedGesture = Gesture.Race(selectionGesture, moveGesture);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setBounds({ height, width });
  };

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (menuOpen) closeMenu();
    else setMenuOpen(true);
  };
  const buttonPosition = toScreenPosition(position, bounds.width, bounds.height);

  if (!enabled || !hydrated) return null;

  return (
    <View
      className="absolute inset-0"
      onLayout={handleLayout}
      pointerEvents="box-none"
      style={{ zIndex: 50 }}
    >
      {bounds.width > 0 && bounds.height > 0 ? (
        <>
          {menuOpen && visibleActions.length > 0 ? (
            <View className="absolute inset-0" pointerEvents="box-none">
              {visibleActions.map((action, index) => {
                const Icon = action.icon;
                const highlighted = selectedIndex === index;
                const target = arcTargets[index];
                return (
                  <Pressable
                    key={action.id}
                    accessibilityLabel={action.label}
                    accessibilityRole="button"
                    className={`h-12 flex-row items-center gap-2 rounded-full border px-3 shadow-md ${
                      highlighted
                        ? 'border-primary bg-primary dark:border-dark-primary dark:bg-dark-primary'
                        : 'border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-900/95'
                    }`}
                    onPress={() => executeAction(index)}
                    style={{
                      left:
                        buttonPosition.x +
                        FLOATING_TOOL_SIZE / 2 +
                        target.x -
                        TOOL_OPTION_WIDTH / 2,
                      position: 'absolute',
                      top:
                        buttonPosition.y +
                        FLOATING_TOOL_SIZE / 2 +
                        target.y -
                        TOOL_OPTION_HEIGHT / 2,
                      width: TOOL_OPTION_WIDTH,
                    }}
                  >
                    <Icon
                      color={highlighted ? palette.background : palette.tint}
                      size={19}
                      strokeWidth={2.3}
                    />
                    <Text
                      className={`text-sm font-bold ${
                        highlighted
                          ? 'text-white'
                          : 'text-textPrimary dark:text-dark-textPrimary'
                      }`}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <GestureDetector gesture={composedGesture}>
            <Animated.View
              className="absolute left-0 top-0"
              style={[{ height: FLOATING_TOOL_SIZE, width: FLOATING_TOOL_SIZE }, animatedStyle]}
            >
              <Pressable
                accessibilityLabel="Card tools. Tap to open, hold and drag to select, or drag to reposition."
                accessibilityRole="button"
                className="h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-primary shadow-lg shadow-black/30 active:scale-95 dark:bg-dark-primary"
                onPress={toggleMenu}
              >
                <Wrench color={palette.background} size={23} strokeWidth={2.4} />
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </>
      ) : null}
    </View>
  );
}
