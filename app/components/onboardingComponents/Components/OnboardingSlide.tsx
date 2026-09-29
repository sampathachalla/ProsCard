import { View, Text, Dimensions } from 'react-native';
import type { OnboardingSlide as OnboardingSlideType } from '../types/onboarding.types';

const { width } = Dimensions.get('window');

export function OnboardingSlide({ slide }: { slide: OnboardingSlideType }) {
  const Icon = slide.icon;

  return (
    <View style={{ width }} className="items-center justify-center px-10">
      <View className="w-24 h-24 rounded-full bg-primary dark:bg-dark-primary items-center justify-center mb-8">
        <Icon color="#FFFFFF" size={40} strokeWidth={2} />
      </View>
      <Text className="text-textPrimary dark:text-dark-textPrimary text-2xl font-extrabold text-center mb-3">
        {slide.title}
      </Text>
      <Text className="text-textMuted dark:text-dark-textMuted text-base text-center leading-6">
        {slide.description}
      </Text>
    </View>
  );
}
