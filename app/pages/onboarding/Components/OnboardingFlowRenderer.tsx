import type { OnboardingFlowItem } from '../types/onboardingFlow.types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { StepWelcome } from './StepWelcome';
import { StepCardCustomization } from './StepCardCustomization';
import { StepOnboardingComplete } from './StepOnboardingComplete';
import { OnboardingAnswerSlide } from './OnboardingAnswerSlide';

export interface OnboardingFlowRendererProps {
  currentItem: OnboardingFlowItem;
  draft: OnboardingDraft;
  errors: Record<string, string>;
  isSaving: boolean;
  isGeneratingCopy?: boolean;
  completionPercent?: number;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  onWelcomeNext: () => void;
  onBack?: () => void;
  onFinish: () => void;
}

export function OnboardingFlowRenderer({
  currentItem,
  draft,
  errors,
  isSaving,
  isGeneratingCopy = false,
  completionPercent = 0,
  updateDraft,
  onWelcomeNext,
  onBack,
  onFinish,
}: OnboardingFlowRendererProps) {
  switch (currentItem.kind) {
    case 'welcome':
      return (
        <StepWelcome onGetStarted={onWelcomeNext} isSaving={isSaving} />
      );
    case 'group':
      return (
        <OnboardingAnswerSlide
          title={currentItem.title}
          subtitle={currentItem.subtitle}
          subtitleLines={currentItem.subtitleLines}
          highlightWords={currentItem.highlightWords}
          funTag={currentItem.funTag}
          fields={currentItem.fields}
          draft={draft}
          updateDraft={updateDraft}
          errors={errors}
          isGeneratingCopy={isGeneratingCopy}
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
    case 'complete':
      return (
        <StepOnboardingComplete
          onGoHome={onFinish}
          onBack={onBack}
          completionPercent={completionPercent}
          isSaving={isSaving}
        />
      );
    default:
      return null;
  }
}
