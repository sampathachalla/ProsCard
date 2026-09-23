// components/onboardingComponents/Utils/validateOnboarding.ts
import type {
  OnboardingDraft,
  ValidationErrors,
  ValidationResult,
} from '../types/onboardingStepper.types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[+]?[\d\s().-]{7,20}$/;
export const URL_PATTERN = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i;
export const HANDLE_PATTERN = /^@?[a-zA-Z0-9_.-]+$/;

export function normalizeUrl(
  input: string,
  platform?: 'linkedin' | 'github' | 'x' | 'generic'
): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (platform === 'github') {
    const handle = trimmed.replace(/^@/, '');
    if (/^[a-zA-Z0-9_-]+$/.test(handle)) {
      return `https://github.com/${handle}`;
    }
  }

  if (platform === 'x') {
    const handle = trimmed.replace(/^@/, '');
    if (/^[a-zA-Z0-9_]+$/.test(handle)) {
      return `https://x.com/${handle}`;
    }
  }

  if (platform === 'linkedin') {
    if (!trimmed.toLowerCase().includes('linkedin.com')) {
      const handle = trimmed.replace(/^\/?in\//, '').replace(/^@/, '');
      return `https://linkedin.com/in/${handle}`;
    }
  }

  return `https://${trimmed}`;
}

export function validatePersonalStep(
  draft: Pick<OnboardingDraft, 'fullName' | 'title' | 'phone' | 'location'> &
    Partial<Pick<OnboardingDraft, 'firstName' | 'lastName' | 'tagline' | 'profilePhotoUrl' | 'coverPhotoUrl'>>
): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedName = draft.fullName?.trim() || '';
  const usesStructuredName = Boolean(draft.firstName?.trim() || draft.lastName?.trim());

  if (usesStructuredName && !draft.firstName?.trim()) {
    errors.firstName = 'First name is required.';
  }
  if (usesStructuredName && !draft.lastName?.trim()) {
    errors.lastName = 'Last name is required.';
  }
  if (!usesStructuredName && !trimmedName) {
    errors.fullName = 'Full name is required.';
  } else if (!usesStructuredName && trimmedName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (trimmedName.length > 50) {
    errors.fullName = 'Full name must be 50 characters or less.';
  }

  const trimmedPhone = draft.phone?.trim() || '';
  if (trimmedPhone) {
    const digitCount = (trimmedPhone.match(/\d/g) || []).length;
    if (digitCount < 7 || !PHONE_PATTERN.test(trimmedPhone)) {
      errors.phone = 'Enter a valid phone number.';
    }
  }

  if (draft.title && draft.title.trim().length > 80) {
    errors.title = 'Title must be 80 characters or less.';
  }

  if (draft.location && draft.location.trim().length > 100) {
    errors.location = 'Location must be 100 characters or less.';
  }
  if (draft.tagline && draft.tagline.trim().length > 120) errors.tagline = 'Tagline must be 120 characters or less.';

  for (const [key, value] of [['profilePhotoUrl', draft.profilePhotoUrl], ['coverPhotoUrl', draft.coverPhotoUrl]] as const) {
    if (value?.trim() && !URL_PATTERN.test(value.trim())) errors[key] = 'Enter a valid image URL.';
  }

  return errors;
}

export function validateProfessionalStep(
  draft: Pick<OnboardingDraft, 'organization' | 'workEmail' | 'shortBio'> &
    Partial<Pick<OnboardingDraft, 'department' | 'companyLogoUrl'>>
): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedEmail = draft.workEmail?.trim() || '';

  if (!trimmedEmail) {
    errors.workEmail = 'Work email is required.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.workEmail = 'Enter a valid email address.';
  }

  if (draft.organization && draft.organization.trim().length > 100) {
    errors.organization = 'Company name must be 100 characters or less.';
  }

  if (draft.department && draft.department.trim().length > 100) errors.department = 'Department must be 100 characters or less.';
  if (draft.companyLogoUrl?.trim() && !URL_PATTERN.test(draft.companyLogoUrl.trim())) errors.companyLogoUrl = 'Enter a valid logo URL.';

  if (draft.shortBio && draft.shortBio.trim().length > 240) {
    errors.shortBio = 'Bio must be 240 characters or less.';
  }

  return errors;
}

export function validateSocialStep(
  draft: Pick<OnboardingDraft, 'linkedin' | 'github' | 'x' | 'website' | 'portfolio'> &
    Partial<Pick<OnboardingDraft, 'facebook' | 'instagram' | 'whatsapp' | 'youtube' | 'tiktok'>>
): ValidationErrors {
  const errors: ValidationErrors = {};

  const validateUrlOnly = (value: string | undefined, fieldKey: string, label: string) => {
    const trimmed = value?.trim() || '';
    if (!trimmed) return;
    if (!URL_PATTERN.test(trimmed)) {
      errors[fieldKey] = `Enter a valid ${label}.`;
    }
  };

  const validateUrlOrHandle = (value: string | undefined, fieldKey: string, label: string) => {
    const trimmed = value?.trim() || '';
    if (!trimmed) return;
    const isValid = URL_PATTERN.test(trimmed) || HANDLE_PATTERN.test(trimmed);
    if (!isValid) {
      errors[fieldKey] = `Enter a valid ${label}.`;
    }
  };

  validateUrlOnly(draft.website, 'website', 'website URL');
  validateUrlOrHandle(draft.linkedin, 'linkedin', 'LinkedIn URL or profile');
  validateUrlOrHandle(draft.github, 'github', 'GitHub URL or username');
  validateUrlOrHandle(draft.x, 'x', 'X/Twitter handle or URL');
  validateUrlOnly(draft.portfolio, 'portfolio', 'portfolio URL');
  validateUrlOnly(draft.facebook, 'facebook', 'Facebook URL');
  validateUrlOnly(draft.instagram, 'instagram', 'Instagram URL');
  validateUrlOnly(draft.whatsapp, 'whatsapp', 'WhatsApp URL');
  validateUrlOnly(draft.youtube, 'youtube', 'YouTube URL');
  validateUrlOnly(draft.tiktok, 'tiktok', 'TikTok URL');

  return errors;
}

export function validateCustomizationStep(
  draft: Pick<OnboardingDraft, 'cardGradient' | 'cardCategory'>
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!draft.cardGradient || draft.cardGradient.length !== 2 || !draft.cardGradient[0] || !draft.cardGradient[1]) {
    errors.cardGradient = 'Please select a valid card theme.';
  }
  if (!draft.cardCategory?.trim()) {
    errors.cardCategory = 'Please select a card category.';
  }
  return errors;
}

export function validateStep(step: number, draft: OnboardingDraft): ValidationErrors {
  switch (step) {
    case 1:
      return {};
    case 2:
      return validatePersonalStep(draft);
    case 3:
      return validateProfessionalStep(draft);
    case 4:
      return validateSocialStep(draft);
    case 5:
      return validateCustomizationStep(draft);
    default:
      return {};
  }
}

export function validateAllSteps(draft: OnboardingDraft): {
  isValid: boolean;
  errors: ValidationErrors;
  firstErrorStep: number | null;
} {
  const s2 = validatePersonalStep(draft);
  if (Object.keys(s2).length > 0) return { isValid: false, errors: s2, firstErrorStep: 2 };

  const s3 = validateProfessionalStep(draft);
  if (Object.keys(s3).length > 0) return { isValid: false, errors: s3, firstErrorStep: 3 };

  const s4 = validateSocialStep(draft);
  if (Object.keys(s4).length > 0) return { isValid: false, errors: s4, firstErrorStep: 4 };

  const s5 = validateCustomizationStep(draft);
  if (Object.keys(s5).length > 0) return { isValid: false, errors: s5, firstErrorStep: 5 };

  return { isValid: true, errors: {}, firstErrorStep: null };
}

export function validateOnboardingDraft(draft: OnboardingDraft): ValidationResult {
  const allErrors: ValidationErrors = {
    ...validatePersonalStep(draft),
    ...validateProfessionalStep(draft),
    ...validateSocialStep(draft),
    ...validateCustomizationStep(draft),
  };

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
}
