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
      'test_validatePersonalStep_empty_firstName_returns_required_error',
      () => {
        const result = validatePersonalStep({ firstName: '', lastName: 'Doe', title: 'Engineer' });
        assertEqual(result.firstName, 'First name is required.');
      },
    ],
    [
      'test_validatePersonalStep_empty_lastName_returns_required_error',
      () => {
        const result = validatePersonalStep({ firstName: 'Jane', lastName: '', title: 'Engineer' });
        assertEqual(result.lastName, 'Last name is required.');
      },
    ],
    [
      'test_validatePersonalStep_empty_title_returns_required_error',
      () => {
        const result = validatePersonalStep({ firstName: 'Jane', lastName: 'Doe', title: '' });
        assertEqual(result.title, 'Title is required.');
      },
    ],
    [
      'test_validatePersonalStep_valid_identity_passes',
      () => {
        const result = validatePersonalStep({ firstName: 'Jane', lastName: 'Doe', title: 'Engineer' });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validatePersonalStep_title_too_long_returns_error',
      () => {
        const result = validatePersonalStep({
          firstName: 'Jane',
          lastName: 'Doe',
          title: 'T'.repeat(81),
        });
        assertEqual(result.title, 'Title must be 80 characters or less.');
      },
    ],
    [
      'test_validateProfessionalStep_empty_email_returns_error',
      () => {
        const result = validateProfessionalStep({ organization: 'Acme', email: '', phone: '' });
        assertEqual(result.email, 'Email is required.');
      },
    ],
    [
      'test_validateProfessionalStep_invalid_email_returns_error',
      () => {
        const result = validateProfessionalStep({
          organization: 'Acme',
          email: 'notanemail',
          phone: '',
        });
        assertEqual(result.email, 'Enter a valid email address.');
      },
    ],
    [
      'test_validateProfessionalStep_valid_email_passes',
      () => {
        const result = validateProfessionalStep({
          organization: 'Acme',
          email: 'jane@acme.com',
          phone: '',
        });
        assertDeepEqual(result, {});
      },
    ],
    [
      'test_validateProfessionalStep_invalid_phone_returns_error',
      () => {
        const result = validateProfessionalStep({
          organization: 'Acme',
          email: 'jane@acme.com',
          phone: '123',
        });
        assertEqual(result.phone, 'Enter a valid phone number.');
      },
    ],
    [
      'test_validateSocialStep_all_empty_is_valid_since_optional',
      () => {
        const result = validateSocialStep({
          linkedin: '',
          github: '',
          x: '',
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
      'test_validateSocialStep_enforces_url_format_on_portfolio',
      () => {
        const result = validateSocialStep({
          linkedin: 'janedoe',
          github: 'janedoe',
          x: '@janedoe',
          portfolio: 'not_a_url',
        });
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
        assertEqual(Boolean(result.errors.firstName), true);
      },
    ],
    [
      'test_validateOnboardingDraft_succeeds_when_all_required_fields_present',
      () => {
        const completeDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          firstName: 'Sampath',
          lastName: 'K',
          title: 'Engineer',
          email: 'sampath@proscard.app',
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
