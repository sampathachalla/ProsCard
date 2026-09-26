import type { OnboardingDraft, ValidationErrors } from '../types/onboardingStepper.types';
import type { OnboardingFlowGroupId } from '../types/onboardingFlow.types';
import {
  validateCustomizationStep,
  validatePersonalStep,
  validateProfessionalStep,
  validateSocialStep,
} from './validateOnboarding';

function pickErrors(all: ValidationErrors, keys: string[]): ValidationErrors {
  const out: ValidationErrors = {};
  for (const key of keys) {
    if (all[key]) out[key] = all[key];
  }
  return out;
}

/** Optional groups: no required-field errors when user skipped empty. */
function isOptionalGroup(groupId: OnboardingFlowGroupId): boolean {
  return (
    groupId === 'name_formal' ||
    groupId === 'credentials' ||
    groupId === 'contact_phone' ||
    groupId === 'work_extra' ||
    groupId === 'presence'
  );
}

export function validateFlowGroup(
  groupId: OnboardingFlowGroupId,
  draft: OnboardingDraft,
  options?: { skipped?: boolean }
): ValidationErrors {
  if (options?.skipped && isOptionalGroup(groupId)) {
    return {};
  }

  switch (groupId) {
    case 'name_legal':
      return pickErrors(validatePersonalStep(draft), ['firstName', 'lastName']);
    case 'name_formal':
      return pickErrors(validatePersonalStep(draft), [
        'prefix',
        'middleName',
        'suffix',
        'preferredName',
        'accreditations',
        'tagline',
      ]);
    case 'role_company':
      return pickErrors(validatePersonalStep(draft), ['title', 'organization']);
    case 'credentials':
      return pickErrors(validatePersonalStep(draft), ['accreditations', 'tagline']);
    case 'contact_email':
      return pickErrors(validateProfessionalStep(draft), ['email']);
    case 'contact_phone':
      return pickErrors(validateProfessionalStep(draft), ['phone']);
    case 'work_extra':
      return pickErrors(validateProfessionalStep(draft), [
        'department',
        'website',
        'businessAddress',
        'shortBio',
        'companyLogoUrl',
      ]);
    case 'presence':
      return validateSocialStep(draft);
    case 'card_style':
      return validateCustomizationStep(draft);
    default:
      return {};
  }
}
