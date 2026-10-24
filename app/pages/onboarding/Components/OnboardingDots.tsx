import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export function OnboardingDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View className="flex-row justify-center" style={{ gap: 8 }}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            width: index === activeIndex ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: index === activeIndex ? palette.tint : palette.border,
          }}
        />
      ))}
    </View>
  );
}
