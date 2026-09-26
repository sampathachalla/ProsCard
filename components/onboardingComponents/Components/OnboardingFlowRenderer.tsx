import type { OnboardingFlowItem } from '../types/onboardingFlow.types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { StepWelcome } from './StepWelcome';
import { StepCardCustomization } from './StepCardCustomization';
import { OnboardingAnswerSlide } from './OnboardingAnswerSlide';

export interface OnboardingFlowRendererProps {
  currentItem: OnboardingFlowItem;
  draft: OnboardingDraft;
  errors: Record<string, string>;
  isSaving: boolean;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  onWelcomeNext: () => void;
  onWelcomeSkip: () => void;
  onFinish: () => void;
}

export function OnboardingFlowRenderer({
  currentItem,
  draft,
  errors,
  isSaving,
  updateDraft,
  onWelcomeNext,
  onWelcomeSkip,
  onFinish,
}: OnboardingFlowRendererProps) {
  switch (currentItem.kind) {
    case 'welcome':
      return (
        <StepWelcome
          onGetStarted={onWelcomeNext}
          onSkip={onWelcomeSkip}
          isSaving={isSaving}
        />
      );
    case 'group':
      return (
        <OnboardingAnswerSlide
          title={currentItem.title}
          subtitle={currentItem.subtitle}
          subtitleLines={currentItem.subtitleLines}
          highlightWords={currentItem.highlightWords}
          fields={currentItem.fields}
          draft={draft}
          updateDraft={updateDraft}
          errors={errors}
        />
      );
    case 'card_style':
      return (
        <StepCardCustomization
          draft={draft}
          updateDraft={updateDraft}
          onFinish={onFinish}
          isSaving={isSaving}
        />
      );
    default:
      return null;
  }
}
