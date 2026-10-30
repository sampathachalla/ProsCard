import React, { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/common/ui/Text';
import type { OnboardingDraft, ProfileCopyAssist } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { renderOnboardingField } from './onboardingFieldRegistry';
import { OnboardingRotatingWord } from './OnboardingRotatingWord';
import { OnboardingScrollContext } from './onboardingScrollContext';
import { TaglineAssist } from './TaglineAssist';

export interface OnboardingAnswerSlideProps {
  title: string;
  hideTitle?: boolean;
  subtitle?: string;
  subtitleLines?: [string, string];
  highlightWords?: string[];
  funTag?: string;
  fields: FieldSpec[];
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
  isGeneratingCopy?: boolean;
  /** Tagline and bio writer; the tagline step shows its suggestions above the field. */
  copyAssist?: ProfileCopyAssist;
}

export function OnboardingAnswerSlide({
  title,
  hideTitle = false,
  subtitle,
  subtitleLines,
  highlightWords,
  funTag,
  fields,
  draft,
  updateDraft,
  errors,
  isGeneratingCopy = false,
  copyAssist,
}: OnboardingAnswerSlideProps) {
  const showTaglineAssist = Boolean(copyAssist && fields.some((spec) => spec.key === 'tagline'));
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
              {hideTitle ? null : (
                <Text
                  variant="none"
                  className="text-left text-[28px] font-bold leading-tight tracking-tight text-textPrimary dark:text-dark-textPrimary"
                >
                  {title}
                </Text>
              )}

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

            <View className={`${hideTitle && !subcopy ? 'mt-1' : 'mt-6'} w-full`}>
              {showTaglineAssist && copyAssist ? (
                <TaglineAssist assist={copyAssist} />
              ) : null}
              {isGeneratingCopy && !showTaglineAssist ? (
                <View className="mb-3 flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#38bdf8" />
                  <Text
                    variant="none"
                    className="text-[13px] text-slate-500 dark:text-slate-400"
                  >
                    Writing suggestions from your profile…
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
