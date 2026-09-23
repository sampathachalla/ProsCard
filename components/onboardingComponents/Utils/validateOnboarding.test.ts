// components/onboardingComponents/Utils/validateOnboarding.test.ts
import {
  normalizeUrl,
  validatePersonalStep,
  validateProfessionalStep,
  validateSocialStep,
  validateCustomizationStep,
  validateAllSteps,
  validateOnboardingDraft,
} from './validateOnboarding';
import { INITIAL_ONBOARDING_DRAFT } from '../types/onboardingStepper.types';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, msg?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assert failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${msg || ''}`);
  }
}

export function runValidateOnboardingTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const testCases: [string, () => void][] = [
    [
      'test_validatePersonalStep_empty_fullName_returns_required_error',
      () => {
        const result = validatePersonalStep({ fullName: '   ', title: '', phone: '', location: '' });
        assertEqual(result.fullName, 'Full name is required.');
      },
    ],
    [
      'test_validatePersonalStep_short_fullName_returns_length_error',
      () => {
        const result = validatePersonalStep({ fullName: 'A', title: '', phone: '', location: '' });
        assertEqual(result.fullName, 'Full name must be at least 2 characters.');
      },
    ],
    [
      'test_validatePersonalStep_valid_fullName_passes',
      () => {
        const result = validatePersonalStep({ fullName: 'Jane Doe', title: 'Engineer', phone: '', location: 'NYC' });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validatePersonalStep_invalid_phone_returns_error',
      () => {
        const result = validatePersonalStep({ fullName: 'Jane Doe', title: '', phone: '123', location: '' });
        assertEqual(result.phone, 'Enter a valid phone number.');
      },
    ],
    [
      'test_validatePersonalStep_valid_phone_passes',
      () => {
        const result = validatePersonalStep({ fullName: 'Jane Doe', title: '', phone: '+1 (555) 123-4567', location: '' });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateProfessionalStep_empty_workEmail_returns_error',
      () => {
        const result = validateProfessionalStep({ organization: 'Acme', workEmail: '', shortBio: '' });
        assertEqual(result.workEmail, 'Work email is required.');
      },
    ],
    [
      'test_validateProfessionalStep_invalid_workEmail_returns_error',
      () => {
        const result = validateProfessionalStep({ organization: 'Acme', workEmail: 'notanemail', shortBio: '' });
        assertEqual(result.workEmail, 'Enter a valid email address.');
      },
    ],
    [
      'test_validateProfessionalStep_valid_workEmail_passes',
      () => {
        const result = validateProfessionalStep({ organization: 'Acme', workEmail: 'jane@acme.com', shortBio: 'Hello' });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateSocialStep_all_empty_is_valid_since_optional',
      () => {
        const result = validateSocialStep({
          linkedin: '',
          github: '',
          x: '',
          website: '',
          portfolio: '',
        });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateSocialStep_valid_urls_and_handles_pass',
      () => {
        const result = validateSocialStep({
          linkedin: 'https://linkedin.com/in/janedoe',
          github: 'janedoe',
          x: '@janedoe',
          website: 'janedoe.com',
          portfolio: 'https://janedoe.dev',
        });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateCustomizationStep_valid_defaults_pass',
      () => {
        const result = validateCustomizationStep({
          cardGradient: ['#2563eb', '#00a8e8'],
          cardCategory: 'Professional',
        });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateCustomizationStep_missing_category_returns_error',
      () => {
        const result = validateCustomizationStep({
          cardGradient: ['#2563eb', '#00a8e8'],
          cardCategory: '   ',
        });
        assertEqual(result.cardCategory, 'Please select a card category.');
      },
    ],
    [
      'test_normalizeUrl_prefixes_protocol_on_bare_domain',
      () => {
        assertEqual(normalizeUrl('example.com'), 'https://example.com');
      },
    ],
    [
      'test_normalizeUrl_preserves_existing_https',
      () => {
        assertEqual(normalizeUrl('https://example.com'), 'https://example.com');
      },
    ],
    [
      'test_normalizeUrl_normalizes_github_handle',
      () => {
        assertEqual(normalizeUrl('torvalds', 'github'), 'https://github.com/torvalds');
      },
    ],
    [
      'test_normalizeUrl_normalizes_x_handle',
      () => {
        assertEqual(normalizeUrl('@sampath', 'x'), 'https://x.com/sampath');
      },
    ],
    [
      'test_normalizeUrl_normalizes_github_handle_with_at',
      () => {
        assertEqual(normalizeUrl('@torvalds', 'github'), 'https://github.com/torvalds');
      },
    ],
    [
      'test_normalizeUrl_normalizes_linkedin_handle_with_dot',
      () => {
        assertEqual(normalizeUrl('john.doe', 'linkedin'), 'https://linkedin.com/in/john.doe');
      },
    ],
    [
      'test_validateSocialStep_enforces_url_format_on_website_and_portfolio',
      () => {
        const result = validateSocialStep({
          linkedin: 'janedoe',
          github: 'janedoe',
          x: '@janedoe',
          website: 'not_a_url',
          portfolio: 'not_a_url',
        });
        assertEqual(Boolean(result.website), true);
        assertEqual(Boolean(result.portfolio), true);
        assertEqual(Boolean(result.linkedin), false);
      },
    ],
    [
      'test_validateAllSteps_fails_when_draft_is_empty',
      () => {
        const result = validateAllSteps(INITIAL_ONBOARDING_DRAFT);
        assertEqual(result.isValid, false);
        assertEqual(result.firstErrorStep, 2);
        assertEqual(Boolean(result.errors.fullName), true);
      },
    ],
    [
      'test_validateOnboardingDraft_succeeds_when_all_required_fields_present',
      () => {
        const completeDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          fullName: 'Sampath K',
          workEmail: 'sampath@proscard.app',
        };
        const result = validateOnboardingDraft(completeDraft);
        assertEqual(result.isValid, true);
        assertDeepEqual(result.errors, {});
      },
    ],
  ];

  for (const [name, fn] of testCases) {
    try {
      fn();
      passed++;
    } catch (err) {
      console.error(`FAILED: ${name}:`, err);
      failed++;
    }
  }

  return { passed, failed };
}
