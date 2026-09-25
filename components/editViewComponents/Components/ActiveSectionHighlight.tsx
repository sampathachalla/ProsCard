import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const GLOW_WIDTH = 18;
const GLOW_HEIGHT = 5;

function OrbitingGlow({
  color,
  height,
  offset,
  progress,
  width,
}: {
  color: string;
  height: number;
  offset: number;
  progress: SharedValue<number>;
  width: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const perimeter = Math.max(1, 2 * (width + height));
    const distance = ((progress.value + offset) % 1) * perimeter;
    let x = 0;
    let y = 0;

    if (distance <= width) {
      x = distance;
    } else if (distance <= width + height) {
      x = width;
      y = distance - width;
    } else if (distance <= 2 * width + height) {
      x = width - (distance - width - height);
      y = height;
    } else {
      y = height - (distance - 2 * width - height);
    }

    return {
      transform: [
        { translateX: x - GLOW_WIDTH / 2 },
        { translateY: y - GLOW_HEIGHT / 2 },
      ],
    };
  }, [height, offset, progress, width]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: GLOW_WIDTH,
          height: GLOW_HEIGHT,
          borderRadius: 3,
          backgroundColor: color,
          elevation: 10,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.82,
          shadowRadius: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

/** A Gemini-inspired moving perimeter glow using only ProsCard brand colors. */
export function ActiveSectionHighlight() {
  const progress = useSharedValue(0);
  const [frame, setFrame] = useState({ height: 0, width: 0 });

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 rounded-lg"
      onLayout={(event) => {
        const { height, width } = event.nativeEvent.layout;
        setFrame({ height, width });
      }}
      style={{
        borderColor: 'rgba(37, 99, 235, 0.72)',
        borderWidth: 2,
        elevation: 5,
        shadowColor: Colors.palette.brandCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 5,
        zIndex: 20,
      }}
    >
      {frame.width > 0 && frame.height > 0 ? (
        <>
          <OrbitingGlow
            color={Colors.palette.primaryCta}
            height={frame.height}
            offset={0}
            progress={progress}
            width={frame.width}
          />
          <OrbitingGlow
            color={Colors.palette.brandCyanLight}
            height={frame.height}
            offset={0.5}
            progress={progress}
            width={frame.width}
          />
        </>
      ) : null}
    </View>
  );
}
