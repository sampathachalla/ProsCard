import type { OnboardingDraft, ValidationErrors } from '../types/onboardingStepper.types';
import type { OnboardingFlowGroupId } from '../types/onboardingFlow.types';
import {
  validateCustomizationStep,
  validatePersonalStep,
  validateProfessionalStep,
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
    groupId === 'tagline' ||
    groupId === 'contact_phone' ||
    groupId === 'work_logo_website' ||
    groupId === 'work_dept_address' ||
    groupId === 'short_bio' ||
    groupId === 'presence' ||
    groupId === 'social_links'
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
      return pickErrors(validatePersonalStep(draft), [
        'firstName',
        'lastName',
        'prefix',
        'middleName',
        'suffix',
        'accreditations',
      ]);
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
    case 'tagline':
      return pickErrors(validatePersonalStep(draft), ['tagline']);
    case 'contact_email':
      return pickErrors(validateProfessionalStep(draft), ['email', 'phone']);
    case 'contact_phone':
      return pickErrors(validateProfessionalStep(draft), ['phone']);
    case 'work_logo_website':
      return pickErrors(validateProfessionalStep(draft), ['website', 'companyLogoUrl']);
    case 'work_dept_address':
      return pickErrors(validateProfessionalStep(draft), ['department', 'businessAddress']);
    case 'short_bio':
      return pickErrors(validateProfessionalStep(draft), ['shortBio']);
    case 'presence':
      return pickErrors(validatePersonalStep(draft), ['tagline']);
    case 'social_links':
      // Optional step: allow Continue to completion; social URLs are checked on finalize.
      return {};
    case 'card_style':
      return validateCustomizationStep(draft);
    default:
      return {};
  }
}
