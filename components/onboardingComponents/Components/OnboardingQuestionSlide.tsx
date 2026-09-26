import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/uiComponents/Text';

export interface OnboardingQuestionSlideProps {
  title: string;
  subtitle?: string;
}

export function OnboardingQuestionSlide({ title, subtitle }: OnboardingQuestionSlideProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      className="flex-1 justify-center px-6 py-8"
    >
      <Text className="text-center text-[26px] font-bold leading-8 tracking-tight text-textPrimary dark:text-dark-textPrimary">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-3 text-center text-[15px] leading-6 text-textMuted dark:text-dark-textMuted">
          {subtitle}
        </Text>
      ) : null}
      <View className="mt-6 self-center h-1 w-12 rounded-full bg-primary dark:bg-dark-primary" />
    </Animated.View>
  );
}
