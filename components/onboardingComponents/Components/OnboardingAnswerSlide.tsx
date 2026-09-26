import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/uiComponents/Text';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { renderOnboardingField } from './onboardingFieldRegistry';

export interface OnboardingAnswerSlideProps {
  title: string;
  subtitle?: string;
  fields: FieldSpec[];
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function OnboardingAnswerSlide({
  title,
  subtitle,
  fields,
  draft,
  updateDraft,
  errors,
}: OnboardingAnswerSlideProps) {
  const isNameFormalRow =
    fields.length === 3 &&
    fields.every((f) => ['prefix', 'middleName', 'suffix'].includes(f.key));

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View entering={FadeInDown.duration(350)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(350)} className="mb-6">
            <Text className="text-center text-[26px] font-bold leading-8 tracking-tight text-textPrimary dark:text-dark-textPrimary">
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-3 text-center text-[15px] leading-6 text-textMuted dark:text-dark-textMuted">
                {subtitle}
              </Text>
            ) : null}
            <View className="mt-5 self-center h-1 w-12 rounded-full bg-primary dark:bg-dark-primary" />
          </Animated.View>
          {isNameFormalRow ? (
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="w-24">
                {renderOnboardingField(fields[0], draft, updateDraft, errors)}
              </View>
              <View className="flex-1">
                {renderOnboardingField(fields[1], draft, updateDraft, errors)}
              </View>
              <View className="w-24">
                {renderOnboardingField(fields[2], draft, updateDraft, errors)}
              </View>
            </View>
          ) : (
            fields.map((spec) => renderOnboardingField(spec, draft, updateDraft, errors))
          )}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
