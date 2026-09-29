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
import { OnboardingRotatingWord } from './OnboardingRotatingWord';

const LEGAL_NAME_KEYS = ['firstName', 'lastName'] as const;
const FORMAL_NAME_KEYS = ['prefix', 'middleName', 'suffix'] as const;

function splitCombinedNameFields(fields: FieldSpec[]) {
  const accreditationField = fields.find((f) => f.key === 'accreditations');
  const nameFields = fields.filter((f) => f.key !== 'accreditations');
  const legalFields = nameFields.filter((f) =>
    (LEGAL_NAME_KEYS as readonly string[]).includes(f.key)
  );
  const formalFields = nameFields.filter((f) =>
    (FORMAL_NAME_KEYS as readonly string[]).includes(f.key)
  );
  const isCombinedNameStep =
    legalFields.length === 2 &&
    formalFields.length === 3 &&
    nameFields.length === 5 &&
    (fields.length === 5 || (fields.length === 6 && accreditationField));
  return { legalFields, formalFields, accreditationField, isCombinedNameStep };
}

export interface OnboardingAnswerSlideProps {
  title: string;
  subtitle?: string;
  subtitleLines?: [string, string];
  highlightWords?: string[];
  funTag?: string;
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
  funTag,
  fields,
  draft,
  updateDraft,
  errors,
}: OnboardingAnswerSlideProps) {
  const { legalFields, formalFields, accreditationField, isCombinedNameStep } =
    splitCombinedNameFields(fields);
  const isNameFormalRow =
    !isCombinedNameStep &&
    fields.length === 3 &&
    fields.every((f) => (FORMAL_NAME_KEYS as readonly string[]).includes(f.key));

  const hasHighlightWords = Boolean(highlightWords && highlightWords.length > 0);
  const subcopy = funTag || subtitle;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <Animated.View entering={FadeInDown.duration(320)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="w-full max-w-[400px] self-center">
            <Animated.View entering={FadeIn.duration(280)} className="items-center">
              <Text
                variant="none"
                className="text-center text-[28px] font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
              >
                {title}
              </Text>

              {subcopy ? (
                <Text
                  variant="none"
                  className="mt-3 text-center text-[16px] font-medium leading-6 text-textMuted dark:text-dark-textMuted"
                >
                  {subcopy}
                </Text>
              ) : null}

              {hasHighlightWords ? (
                <View className="mt-4 items-center">
                  {subtitleLines ? (
                    <View className="items-center">
                      <Text
                        variant="none"
                        className="text-center text-xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                      >
                        {subtitleLines[0]}
                      </Text>
                      <Text
                        variant="none"
                        className="mt-1 text-center text-xl font-medium leading-snug text-textMuted dark:text-dark-textMuted"
                      >
                        {subtitleLines[1]}
                      </Text>
                    </View>
                  ) : null}
                  <OnboardingRotatingWord className="mt-2" words={highlightWords!} />
                </View>
              ) : subtitleLines && !subcopy ? (
                <View className="mt-3 items-center">
                  <Text
                    variant="none"
                    className="text-center text-[16px] font-medium leading-6 text-textMuted dark:text-dark-textMuted"
                  >
                    {subtitleLines[0]}
                  </Text>
                  <Text
                    variant="none"
                    className="mt-1 text-center text-[16px] font-medium leading-6 text-textMuted dark:text-dark-textMuted"
                  >
                    {subtitleLines[1]}
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            <View className="mt-10 w-full gap-1 pb-2">
              {isCombinedNameStep ? (
                <>
                  <View className="flex-row" style={{ gap: 12 }}>
                    <View className="flex-1">
                      {renderOnboardingField(
                        formalFields.find((f) => f.key === 'prefix')!,
                        draft,
                        updateDraft,
                        errors
                      )}
                    </View>
                    <View className="flex-1">
                      {renderOnboardingField(
                        formalFields.find((f) => f.key === 'suffix')!,
                        draft,
                        updateDraft,
                        errors
                      )}
                    </View>
                  </View>
                  {legalFields
                    .filter((f) => f.key === 'firstName')
                    .map((spec) => (
                      <View key={spec.key}>
                        {renderOnboardingField(spec, draft, updateDraft, errors)}
                      </View>
                    ))}
                  {formalFields
                    .filter((f) => f.key === 'middleName')
                    .map((spec) => (
                      <View key={spec.key}>
                        {renderOnboardingField(spec, draft, updateDraft, errors)}
                      </View>
                    ))}
                  {legalFields
                    .filter((f) => f.key === 'lastName')
                    .map((spec) => (
                      <View key={spec.key}>
                        {renderOnboardingField(spec, draft, updateDraft, errors)}
                      </View>
                    ))}
                  {accreditationField ? (
                    <View className="mt-2" key={accreditationField.key}>
                      {renderOnboardingField(accreditationField, draft, updateDraft, errors)}
                    </View>
                  ) : null}
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
                fields.map((spec) => (
                  <View key={String(spec.key)}>
                    {renderOnboardingField(spec, draft, updateDraft, errors)}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
