import React, { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/common/ui/Text';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { renderOnboardingField } from './onboardingFieldRegistry';
import { OnboardingRotatingWord } from './OnboardingRotatingWord';
import { OnboardingScrollContext } from './onboardingScrollContext';

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
  isGeneratingCopy?: boolean;
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
  isGeneratingCopy = false,
}: OnboardingAnswerSlideProps) {
  const hasHighlightWords = Boolean(highlightWords && highlightWords.length > 0);
  const subcopy = funTag || subtitle;
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const ensureFocusedVisible = useCallback((target?: number) => {
    // Re-run after the keyboard changes the viewport so fields near the bottom remain visible.
    const scroll = () => {
      if (target != null) {
        scrollRef.current
          ?.getScrollResponder()
          ?.scrollResponderScrollNativeHandleToKeyboard(target, 24, true);
        return;
      }
      scrollRef.current?.scrollToEnd({ animated: true });
    };
    requestAnimationFrame(scroll);
    setTimeout(scroll, 120);
    setTimeout(scroll, 320);
  }, []);

  const scrollApi = useMemo(
    () => ({ ensureFocusedVisible }),
    [ensureFocusedVisible],
  );

  return (
    <OnboardingScrollContext.Provider value={scrollApi}>
      <Animated.View
        entering={FadeInDown.duration(280)}
        className="flex-1 bg-background dark:bg-dark-background"
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          bounces={false}
          overScrollMode="never"
        >
          <View className="w-full max-w-[440px] self-center">
            <Animated.View entering={FadeIn.duration(240)} className="items-start">
              <Text
                variant="none"
                className="text-left text-[28px] font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
              >
                {title}
              </Text>

              {subcopy ? (
                <Text
                  variant="none"
                  className="mt-1.5 text-left text-[15px] font-normal leading-5 text-slate-500 dark:text-slate-400"
                >
                  {subcopy}
                </Text>
              ) : null}

              {hasHighlightWords ? (
                <View className="mt-2 items-start">
                  <OnboardingRotatingWord className="mt-1" words={highlightWords!} />
                </View>
              ) : subtitleLines && !subcopy ? (
                <View className="mt-1.5 items-start">
                  <Text
                    variant="none"
                    className="text-left text-[15px] font-normal leading-5 text-slate-500 dark:text-slate-400"
                  >
                    {subtitleLines[0]}
                  </Text>
                  <Text
                    variant="none"
                    className="mt-0.5 text-left text-[15px] font-normal leading-5 text-slate-500 dark:text-slate-400"
                  >
                    {subtitleLines[1]}
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            <View className="mt-6 w-full">
              {isGeneratingCopy ? (
                <View className="mb-3 flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#38bdf8" />
                  <Text
                    variant="none"
                    className="text-[13px] text-slate-500 dark:text-slate-400"
                  >
                    Writing a suggestion from your profile…
                  </Text>
                </View>
              ) : null}
              {fields.map((spec) => (
                <View key={String(spec.key)}>
                  {renderOnboardingField(spec, draft, updateDraft, errors)}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </OnboardingScrollContext.Provider>
  );
}
