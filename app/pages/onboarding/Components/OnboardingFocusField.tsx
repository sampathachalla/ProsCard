import { Pressable, View } from 'react-native';
import { Text } from '@/common/ui/Text';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { focusStartersFor } from '../Utils/profileCopyFacts';
import { OnboardingFormField } from './OnboardingFormField';

const MAX_FOCUS_LENGTH = 160;

type Props = {
  spec: FieldSpec;
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
};

/** The focus question: free text plus tap-to-add starters matched to the job title. */
export function OnboardingFocusField({ spec, draft, updateDraft }: Props) {
  const focus = draft.focus ?? '';
  const maxLength = spec.maxLength ?? MAX_FOCUS_LENGTH;
  const starters = focusStartersFor(draft.title).filter(
    (starter) => !focus.toLowerCase().includes(starter.toLowerCase()),
  );

  const addStarter = (starter: string) => {
    const next = focus.trim() ? `${focus.trim()}, ${starter}` : starter;
    updateDraft({ focus: next.slice(0, maxLength) });
  };

  return (
    <View className="w-full">
      <OnboardingFormField
        label={spec.label}
        value={focus}
        onChangeText={(text) => updateDraft({ focus: text })}
        placeholder={spec.placeholder}
        hint="Optional, but it’s what makes your headline about you."
        maxLength={maxLength}
        multiline
        numberOfLines={2}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
        variant="boxed"
      />
      {starters.length > 0 ? (
        <View className="mt-1 flex-row flex-wrap gap-2">
          {starters.map((starter) => (
            <Pressable
              key={starter}
              accessibilityRole="button"
              accessibilityLabel={`Add ${starter} to your focus`}
              onPress={() => addStarter(starter)}
              className="rounded-full border border-slate-200 bg-card px-3 py-1.5 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
            >
              <Text variant="none" className="text-[13px] font-medium text-textPrimary dark:text-dark-textPrimary">
                + {starter}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
