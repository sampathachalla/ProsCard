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

function isContactReachStep(fields: FieldSpec[]) {
  const keys = new Set(fields.map((field) => field.key));
  return keys.has('email') && keys.has('phone');
}

function isLogoWebsiteStep(fields: FieldSpec[]) {
  if (fields.length !== 2) return false;
  const keys = new Set(fields.map((field) => field.key));
  return keys.has('companyLogoUrl') && keys.has('website');
}

function isDeptAddressStep(fields: FieldSpec[]) {
  if (fields.length !== 2) return false;
  const keys = new Set(fields.map((field) => field.key));
  return keys.has('department') && keys.has('businessAddress');
}

function isRoleCompanyStep(fields: FieldSpec[]) {
  if (fields.length !== 2) return false;
  const keys = new Set(fields.map((field) => field.key));
  return keys.has('title') && keys.has('organization');
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
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { legalFields, formalFields, accreditationField, isCombinedNameStep } =
    splitCombinedNameFields(fields);
  const isNameFormalRow =
    !isCombinedNameStep &&
    fields.length === 3 &&
    fields.every((f) => (FORMAL_NAME_KEYS as readonly string[]).includes(f.key));

  const hasHighlightWords = Boolean(highlightWords && highlightWords.length > 0);
  const contactReachStep = isContactReachStep(fields);
  const logoWebsiteStep = isLogoWebsiteStep(fields);
  const deptAddressStep = isDeptAddressStep(fields);
  const roleCompanyStep = isRoleCompanyStep(fields);
  const centerHighlightStep = Boolean(hasHighlightWords && fields.length === 1);
  const singleFieldCenterStep = fields.length === 1 && !hasHighlightWords && !contactReachStep;
  const centerContentStep =
    centerHighlightStep ||
    logoWebsiteStep ||
    deptAddressStep ||
    roleCompanyStep ||
    singleFieldCenterStep;
  const roleHighlightStep =
    hasHighlightWords &&
    fields.length === 2 &&
    !isCombinedNameStep &&
    !contactReachStep;
  const highlightSubtitleMargin = subtitleLines && hasHighlightWords ? 'mt-10' : 'mt-4';
  const fieldsTopMargin = (() => {
    if (contactReachStep) return 'mt-8';
    if (logoWebsiteStep || deptAddressStep || roleCompanyStep || singleFieldCenterStep) {
      return 'mt-8';
    }
    if (!hasHighlightWords) return 'mt-6';
    if (isCombinedNameStep) return 'mt-12';
    if (fields.length === 1) return 'mt-8';
    if (roleHighlightStep) return 'mt-12';
    return fields.length <= 2 ? 'mt-32' : 'mt-16';
  })();
  const scrollMinHeight = Math.max(
    windowHeight - insets.top - insets.bottom - 56 - 128,
    420
  );
  const scrollContentStyle = contactReachStep
    ? {
        flexGrow: 1,
        minHeight: scrollMinHeight,
        justifyContent: 'flex-end' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 104,
      }
    : centerContentStep
    ? {
        flexGrow: 1,
        minHeight: scrollMinHeight,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
      }
    : {
        flexGrow: 1,
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 24,
        paddingTop: roleHighlightStep ? 64 : 44,
        paddingBottom: 32,
      };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View entering={FadeInDown.duration(350)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[380px] self-center">
            <Animated.View
              entering={FadeIn.duration(350)}
              className={
                hasHighlightWords ||
                contactReachStep ||
                logoWebsiteStep ||
                deptAddressStep ||
                roleCompanyStep ||
                singleFieldCenterStep
                  ? ''
                  : 'mb-16'
              }
            >
              <Text
                variant="none"
                className="text-center text-4xl font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
              >
                {title}
              </Text>
              {funTag ? (
                <Text
                  variant="none"
                  className="mt-4 text-center text-base font-medium leading-6 text-textPrimary dark:text-dark-textPrimary"
                >
                  {funTag}
                </Text>
              ) : null}
              {hasHighlightWords ? (
                <View className={highlightSubtitleMargin}>
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
                  <OnboardingRotatingWord className="mt-2" words={highlightWords!} />
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

            <View className={`${fieldsTopMargin} gap-2 pb-2`}>
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
                    .map((spec) => renderOnboardingField(spec, draft, updateDraft, errors))}
                  {formalFields
                    .filter((f) => f.key === 'middleName')
                    .map((spec) => renderOnboardingField(spec, draft, updateDraft, errors))}
                  {legalFields
                    .filter((f) => f.key === 'lastName')
                    .map((spec) => renderOnboardingField(spec, draft, updateDraft, errors))}
                  {accreditationField ? (
                    <View className="mt-4">
                      {renderOnboardingField(
                        accreditationField,
                        draft,
                        updateDraft,
                        errors
                      )}
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
                fields.map((spec) => renderOnboardingField(spec, draft, updateDraft, errors))
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
