import { INITIAL_ONBOARDING_DRAFT } from '../types/onboardingStepper.types';
import { validateFlowGroup } from './validateOnboardingFlowGroup';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export function runValidateOnboardingFlowGroupTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const cases: [string, () => void][] = [
    [
      'validateFlowGroup name_legal requires first and last name',
      () => {
        const errors = validateFlowGroup('name_legal', {
          ...INITIAL_ONBOARDING_DRAFT,
          firstName: '',
          lastName: '',
        });
        if (!errors.firstName || !errors.lastName) {
          throw new Error('Expected firstName and lastName errors');
        }
      },
    ],
    [
      'validateFlowGroup role_company requires title',
      () => {
        const errors = validateFlowGroup('role_company', {
          ...INITIAL_ONBOARDING_DRAFT,
          firstName: 'Ada',
          lastName: 'Lovelace',
          title: '',
        });
        if (!errors.title) throw new Error('Expected title error');
      },
    ],
    [
      'validateFlowGroup contact_email requires valid email',
      () => {
        const errors = validateFlowGroup('contact_email', {
          ...INITIAL_ONBOARDING_DRAFT,
          email: 'bad',
        });
        if (!errors.email) throw new Error('Expected email error');
      },
    ],
    [
      'validateFlowGroup name_formal optional when empty',
      () => {
        const errors = validateFlowGroup('name_formal', INITIAL_ONBOARDING_DRAFT, { skipped: true });
        assertEqual(Object.keys(errors).length, 0);
      },
    ],
    [
      'validateFlowGroup presence optional social urls still validate format',
      () => {
        const errors = validateFlowGroup('presence', {
          ...INITIAL_ONBOARDING_DRAFT,
          linkedin: 'not a url',
        });
        if (!errors.linkedin) throw new Error('Expected linkedin format error');
      },
    ],
  ];

  for (const [name, fn] of cases) {
    try {
      fn();
      passed++;
    } catch (e) {
      failed++;
      console.error(`FAIL ${name}:`, e);
    }
  }

  return { passed, failed };
}
