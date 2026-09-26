import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/uiComponents/Text';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { renderOnboardingField } from './onboardingFieldRegistry';
import { OnboardingRotatingWord } from './OnboardingRotatingWord';

const LEGAL_NAME_KEYS = ['firstName', 'lastName'] as const;
const FORMAL_NAME_KEYS = ['prefix', 'middleName', 'suffix'] as const;

function splitCombinedNameFields(fields: FieldSpec[]) {
  const legalFields = fields.filter((f) =>
    (LEGAL_NAME_KEYS as readonly string[]).includes(f.key)
  );
  const formalFields = fields.filter((f) =>
    (FORMAL_NAME_KEYS as readonly string[]).includes(f.key)
  );
  const isCombinedNameStep =
    legalFields.length === 2 && formalFields.length === 3 && fields.length === 5;
  return { legalFields, formalFields, isCombinedNameStep };
}

export interface OnboardingAnswerSlideProps {
  title: string;
  subtitle?: string;
  subtitleLines?: [string, string];
  highlightWords?: string[];
  fields: FieldSpec[];
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function OnboardingAnswerSlide({
  title,
  subtitle,
  subtitleLines,
  highlightWords,
  fields,
  draft,
  updateDraft,
  errors,
}: OnboardingAnswerSlideProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { legalFields, formalFields, isCombinedNameStep } = splitCombinedNameFields(fields);
  const isNameFormalRow =
    !isCombinedNameStep &&
    fields.length === 3 &&
    fields.every((f) => (FORMAL_NAME_KEYS as readonly string[]).includes(f.key));

  const hasHighlightWords = Boolean(highlightWords && highlightWords.length > 0);
  /** Center block in the area between onboarding top bar and bottom Continue footer. */
  const scrollMinHeight = Math.max(
    windowHeight - insets.top - insets.bottom - 52 - 132,
    360
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View entering={FadeInDown.duration(350)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            minHeight: scrollMinHeight,
            flexGrow: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[380px] self-center">
            <Animated.View entering={FadeIn.duration(350)} className={hasHighlightWords ? '' : 'mb-16'}>
              <Text
                variant="none"
                className="text-center text-4xl font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
              >
                {title}
              </Text>
              {hasHighlightWords ? (
                <View className="mt-12">
                  {subtitleLines ? (
                    <View className="items-center">
                      <Text
                        variant="none"
                        className="text-center text-2xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                      >
                        {subtitleLines[0]}
                      </Text>
                      <Text
                        variant="none"
                        className="mt-1 text-center text-2xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                      >
                        {subtitleLines[1]}
                      </Text>
                    </View>
                  ) : subtitle ? (
                    <Text
                      variant="none"
                      className="text-center text-3xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                  <OnboardingRotatingWord words={highlightWords!} />
                </View>
              ) : subtitleLines ? (
                <View className="mt-12 items-center">
                  <Text
                    variant="none"
                    className="text-center text-2xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                  >
                    {subtitleLines[0]}
                  </Text>
                  <Text
                    variant="none"
                    className="mt-1 text-center text-2xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                  >
                    {subtitleLines[1]}
                  </Text>
                </View>
              ) : subtitle ? (
                <Text
                  variant="none"
                  className="mt-12 text-center text-3xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                >
                  {subtitle}
                </Text>
              ) : null}
            </Animated.View>

            {hasHighlightWords ? <View className="h-8" /> : null}

            <View className={hasHighlightWords ? 'gap-2 pb-2' : ''}>
              {isCombinedNameStep ? (
                <>
                  {legalFields.map((spec) =>
                    renderOnboardingField(spec, draft, updateDraft, errors)
                  )}
                  <View className="mt-6 flex-row" style={{ gap: 12 }}>
                    <View className="w-24">
                      {renderOnboardingField(formalFields[0], draft, updateDraft, errors)}
                    </View>
                    <View className="flex-1">
                      {renderOnboardingField(formalFields[1], draft, updateDraft, errors)}
                    </View>
                    <View className="w-24">
                      {renderOnboardingField(formalFields[2], draft, updateDraft, errors)}
                    </View>
                  </View>
                </>
              ) : isNameFormalRow ? (
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
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
