// components/onboardingComponents/types/onboardingStepper.types.ts

import type { OnboardingFlowItem } from './onboardingFlow.types';

/**
 * Onboarding draft aligned 1:1 with Profile + SocialLinks field names.
 * Card-only fields (gradient / category) stay on the draft for step 5.
 *
 * Field tiers (progressive disclosure):
 * - must: required to create a usable card
 * - nice: shown by default, optional / skippable
 * - later: behind "Add more" expanders; completable in profile after onboarding
 */
export interface OnboardingDraft {
  // Identity
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredName: string;
  accreditations: string;
  /** Derived from structured name parts; not a primary input. */
  fullName: string;
  tagline: string;
  title: string;

  // Professional / contact
  department: string;
  organization: string;
  companyLogoUrl: string;
  email: string;
  phone: string;
  website: string;
  businessAddress: string;
  shortBio: string;

  // Media
  photoUrl: string;
  coverPhotoUrl: string;

  // Social
  linkedin: string;
  github: string;
  x: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
  youtube: string;
  tiktok: string;
  portfolio: string;

  // Card customization (not Profile)
  cardGradient: [string, string];
  cardCategory: string;
}

export type FieldTier = 'must' | 'nice' | 'later';

export interface StepMetadata {
  index: number;
  title: string;
  subtitle: string;
  canSkip: boolean;
  /** Short enterprise progress copy shown in the stepper header. */
  progressLabel: string;
}

export type ValidationErrors = Record<string, string>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export interface UseOnboardingStepperReturn {
  currentStep: number;
  totalSteps: number;
  flowIndex: number;
  currentItem: OnboardingFlowItem;
  progressLabel: string;
  canSkip: boolean;
  draft: OnboardingDraft;
  errors: Record<string, string>;
  isSaving: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  activeStepMeta?: StepMetadata;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  clearError?: (field: string) => void;
  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  skipStep: () => void;
  finalizeOnboarding: () => Promise<boolean>;
}

export interface CardGradientPreset {
  id: string;
  label: string;
  gradient: [string, string];
}

export const ONBOARDING_STEPS_META: StepMetadata[] = [
  {
    index: 1,
    title: 'Welcome',
    subtitle: 'Set up your digital business card',
    canSkip: true,
    progressLabel: 'Getting started',
  },
  {
    index: 2,
    title: 'Identity',
    subtitle: 'Who should appear on your card',
    canSkip: false,
    progressLabel: 'Name & role',
  },
  {
    index: 3,
    title: 'Contact',
    subtitle: 'How people can reach you',
    canSkip: false,
    progressLabel: 'Work & contact',
  },
  {
    index: 4,
    title: 'Presence',
    subtitle: 'Photo and links (optional)',
    canSkip: true,
    progressLabel: 'Photo & links',
  },
  {
    index: 5,
    title: 'Card style',
    subtitle: 'Choose a theme and create your card',
    canSkip: false,
    progressLabel: 'Finalize',
  },
];

export const CARD_GRADIENT_PRESETS: CardGradientPreset[] = [
  { id: 'pro-cyan', label: 'Pros Cyan', gradient: ['#2563eb', '#00a8e8'] },
  { id: 'midnight', label: 'Midnight', gradient: ['#111827', '#020617'] },
  { id: 'slate', label: 'Slate', gradient: ['#334155', '#0f172a'] },
  { id: 'teal', label: 'Teal', gradient: ['#0f766e', '#059669'] },
  { id: 'indigo', label: 'Indigo', gradient: ['#3730a3', '#4f46e5'] },
  { id: 'copper', label: 'Copper', gradient: ['#9a3412', '#b45309'] },
];

export const DEFAULT_CARD_CATEGORIES: string[] = [
  'Professional',
  'Personal',
  'Business',
  'Networking',
];

export const INITIAL_CARD_GRADIENT: [string, string] = ['#2563eb', '#00a8e8'];
export const DEFAULT_CARD_CATEGORY = 'Professional';

export const INITIAL_ONBOARDING_DRAFT: OnboardingDraft = {
  prefix: '',
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  preferredName: '',
  accreditations: '',
  fullName: '',
  tagline: '',
  title: '',
  department: '',
  organization: '',
  companyLogoUrl: '',
  email: '',
  phone: '',
  website: '',
  businessAddress: '',
  shortBio: '',
  photoUrl: '',
  coverPhotoUrl: '',
  linkedin: '',
  github: '',
  x: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
  youtube: '',
  tiktok: '',
  portfolio: '',
  cardGradient: INITIAL_CARD_GRADIENT,
  cardCategory: DEFAULT_CARD_CATEGORY,
};
