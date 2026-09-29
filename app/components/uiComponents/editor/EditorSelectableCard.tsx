import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/uiComponents/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditorSelectableCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  selectedIndicator?: 'dot' | 'check' | 'none';
};

export function EditorSelectableCard({
  label,
  selected,
  onPress,
  accessibilityLabel,
  children,
  className = '',
  style,
  selectedIndicator = 'dot',
}: EditorSelectableCardProps) {
  const flatStyle = StyleSheet.flatten(style) ?? {};
  const { height, minHeight, ...restStyle } = flatStyle as ViewStyle & { height?: number; minHeight?: number };

  // Animate height/minHeight changes with Reanimated (not RN's LayoutAnimation,
  // which conflicts with the Animated.View tree used elsewhere in the editor).
  const animatedHeight = useSharedValue(height ?? 0);
  const animatedMinHeight = useSharedValue(minHeight ?? 0);

  useEffect(() => {
    if (height !== undefined) {
      animatedHeight.value = withTiming(height, { duration: 280 });
    }
  }, [animatedHeight, height]);

  useEffect(() => {
    if (minHeight !== undefined) {
      animatedMinHeight.value = withTiming(minHeight, { duration: 280 });
    }
  }, [animatedMinHeight, minHeight]);

  const animatedSizeStyle = useAnimatedStyle(() => ({
    height: height !== undefined ? animatedHeight.value : undefined,
    minHeight: minHeight !== undefined ? animatedMinHeight.value : undefined,
  }));

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-2xl border p-3 ${
        selected
          ? 'border-primary bg-blue-50 dark:border-dark-primary dark:bg-blue-950/30'
          : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
      } ${className}`}
      style={[restStyle, animatedSizeStyle]}
    >
      {children}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-xs font-bold text-textPrimary dark:text-dark-textPrimary">{label}</Text>
        {selected && selectedIndicator === 'dot' ? (
          <View className="ml-2 h-2.5 w-2.5 rounded-full bg-primary dark:bg-dark-primary" />
        ) : null}
        {selected && selectedIndicator === 'check' ? <Check color="#3b82f6" size={14} /> : null}
      </View>
    </AnimatedPressable>
  );
}
