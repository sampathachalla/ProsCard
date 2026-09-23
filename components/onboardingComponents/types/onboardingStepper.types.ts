// components/onboardingComponents/types/onboardingStepper.types.ts

export interface OnboardingDraft {
  // Step 2: Personal Identity
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredName: string;
  accreditations: string;
  fullName: string;
  tagline: string;
  title: string;
  profilePhotoUrl: string;
  coverPhotoUrl: string;
  phone: string;
  location: string;
  // Step 3: Professional Info
  department: string;
  organization: string;
  companyLogoUrl: string;
  workEmail: string;
  shortBio: string;
  // Step 4: Social & Web Presence
  linkedin: string;
  github: string;
  x: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
  youtube: string;
  tiktok: string;
  website: string;
  portfolio: string;
  // Step 5: Card Customization & Live Preview
  cardGradient: [string, string];
  cardCategory: string;
}

export interface StepMetadata {
  index: number;
  title: string;
  subtitle: string;
  canSkip: boolean;
}

export type ValidationErrors = Record<string, string>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export interface UseOnboardingStepperReturn {
  currentStep: number; // 1 to 5
  totalSteps: number; // 5
  draft: OnboardingDraft;
  errors: Record<string, string>;
  isSaving: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  activeStepMeta?: StepMetadata;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  clearError?: (field: string) => void;
  goToStep: (step: number) => void;
  nextStep: () => boolean; // returns false if validation failed
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
    subtitle: 'Your modern digital business card platform',
    canSkip: true,
  },
  {
    index: 2,
    title: 'Personal Details',
    subtitle: 'Let contacts know who you are',
    canSkip: false,
  },
  {
    index: 3,
    title: 'Professional Info',
    subtitle: 'Where you work and your primary role',
    canSkip: false,
  },
  {
    index: 4,
    title: 'Social & Web',
    subtitle: 'Share your online profiles and portfolio',
    canSkip: true,
  },
  {
    index: 5,
    title: 'Card Preview',
    subtitle: 'Choose your card style and preview in 3D',
    canSkip: false,
  },
];

export const CARD_GRADIENT_PRESETS: CardGradientPreset[] = [
  { id: 'pro-cyan', label: 'Pros Cyan', gradient: ['#2563eb', '#00a8e8'] },
  { id: 'midnight', label: 'Midnight Dark', gradient: ['#111827', '#020617'] },
  { id: 'royal-purple', label: 'Royal Violet', gradient: ['#4f46e5', '#7c3aed'] },
  { id: 'emerald-teal', label: 'Emerald Teal', gradient: ['#0f766e', '#059669'] },
  { id: 'sunset-amber', label: 'Sunset Coral', gradient: ['#ea580c', '#ec4899'] },
  { id: 'slate-charcoal', label: 'Slate Minimal', gradient: ['#334155', '#0f172a'] },
];

export const DEFAULT_CARD_CATEGORIES: string[] = ['Professional', 'Personal', 'Business', 'Networking'];

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
  profilePhotoUrl: '',
  coverPhotoUrl: '',
  phone: '',
  location: '',
  department: '',
  organization: '',
  companyLogoUrl: '',
  workEmail: '',
  shortBio: '',
  linkedin: '',
  github: '',
  x: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
  youtube: '',
  tiktok: '',
  website: '',
  portfolio: '',
  cardGradient: INITIAL_CARD_GRADIENT,
  cardCategory: DEFAULT_CARD_CATEGORY,
};
