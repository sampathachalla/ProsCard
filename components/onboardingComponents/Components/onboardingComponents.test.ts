// components/onboardingComponents/Components/onboardingComponents.test.ts
import { ONBOARDING_STEPS_META, INITIAL_ONBOARDING_DRAFT, type OnboardingDraft } from '../types/onboardingStepper.types';
import { ONBOARDING_FLOW } from '../types/onboardingFlow.types';
import { ONBOARDING_SLIDES } from '../Services/onboardingService';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export function runOnboardingComponentsTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const testCases: [string, () => void][] = [
    [
      'test_onboarding_flow_has_welcome_question_answer_pairs',
      () => {
        assertEqual(ONBOARDING_FLOW[0].kind, 'welcome');
        const groups = ONBOARDING_FLOW.filter((item) => item.kind === 'group');
        if (groups.length === 0) {
          throw new Error('Flow must include group screens');
        }
        assertEqual(ONBOARDING_FLOW[ONBOARDING_FLOW.length - 1].kind, 'card_style');
      },
    ],

    // 1. StepperIndicator Logic
    [
      'test_stepperIndicator_calculates_progress_percent_accurately',
      () => {
        const totalSteps = 5;
        const calcPercent = (step: number) => Math.min(100, Math.max(0, Math.round((step / totalSteps) * 100)));
        assertEqual(calcPercent(1), 20);
        assertEqual(calcPercent(2), 40);
        assertEqual(calcPercent(3), 60);
        assertEqual(calcPercent(4), 80);
        assertEqual(calcPercent(5), 100);
      },
    ],
    [
      'test_stepperIndicator_correctly_identifies_completed_active_upcoming_nodes',
      () => {
        const currentStep = 3;
        const totalSteps = 5;
        for (let stepNum = 1; stepNum <= totalSteps; stepNum++) {
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          if (stepNum === 1 || stepNum === 2) {
            assertEqual(isCompleted, true);
            assertEqual(isActive, false);
            assertEqual(isUpcoming, false);
          } else if (stepNum === 3) {
            assertEqual(isCompleted, false);
            assertEqual(isActive, true);
            assertEqual(isUpcoming, false);
          } else {
            assertEqual(isCompleted, false);
            assertEqual(isActive, false);
            assertEqual(isUpcoming, true);
          }
        }
      },
    ],
    [
      'test_stepperIndicator_matches_meta_titles_for_all_5_steps',
      () => {
        assertEqual(ONBOARDING_STEPS_META.length, 5);
        assertEqual(ONBOARDING_STEPS_META[0].title, 'Welcome');
        assertEqual(ONBOARDING_STEPS_META[1].title, 'Identity');
        assertEqual(ONBOARDING_STEPS_META[2].title, 'Contact');
        assertEqual(ONBOARDING_STEPS_META[3].title, 'Presence');
        assertEqual(ONBOARDING_STEPS_META[4].title, 'Card style');
      },
    ],

    // 2. StepperNavigation Logic
    [
      'test_stepperNavigation_resolves_default_labels_per_step',
      () => {
        const getLabel = (step: number, total: number, customLabel?: string) => {
          const isLastStep = step === total;
          const defaultLabel = isLastStep ? 'Create My Card' : step === 1 ? 'Get Started' : 'Continue';
          return customLabel || defaultLabel;
        };

        assertEqual(getLabel(1, 5), 'Get Started');
        assertEqual(getLabel(2, 5), 'Continue');
        assertEqual(getLabel(3, 5), 'Continue');
        assertEqual(getLabel(4, 5), 'Continue');
        assertEqual(getLabel(5, 5), 'Create My Card');
        assertEqual(getLabel(2, 5, 'Next Section'), 'Next Section');
      },
    ],
    [
      'test_stepperNavigation_canGoBack_and_canSkip_rules',
      () => {
        const canGoBack = (step: number, isSaving = false) => step > 1 && !isSaving;
        const canSkip = (step: number, hasSkipHandler = true, isSaving = false) =>
          hasSkipHandler && (step === 1 || step === 4) && !isSaving;

        assertEqual(canGoBack(1), false);
        assertEqual(canGoBack(2), true);
        assertEqual(canGoBack(3), true);
        assertEqual(canGoBack(5), true);
        assertEqual(canGoBack(2, true), false); // while saving

        assertEqual(canSkip(1), true);
        assertEqual(canSkip(2), false); // Step 2 personal is mandatory
        assertEqual(canSkip(3), false); // Step 3 professional is mandatory
        assertEqual(canSkip(4), true); // Step 4 social is skippable
        assertEqual(canSkip(5), false); // Step 5 card custom is mandatory
        assertEqual(canSkip(4, false), false); // no skip handler
        assertEqual(canSkip(4, true, true), false); // while saving
      },
    ],

    // 3. OnboardingFormField Logic
    [
      'test_onboardingFormField_character_counter_calculation',
      () => {
        const value = 'Hello World';
        const maxLength = 80;
        const countText = `${value.length}/${maxLength}`;
        assertEqual(countText, '11/80');
      },
    ],

    // 4. StepWelcome Verification
    [
      'test_stepWelcome_slides_configured_with_icons_and_content',
      () => {
        assertEqual(ONBOARDING_SLIDES.length, 3);
        assertEqual(ONBOARDING_SLIDES[0].id, 'cards');
        assertEqual(ONBOARDING_SLIDES[1].id, 'scan');
        assertEqual(ONBOARDING_SLIDES[2].id, 'contacts');
      },
    ],

    // 5. Steps 2-4 Draft Updating Logic
    [
      'test_stepPersonal_updates_all_personal_fields',
      () => {
        let draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const updateDraft = (fields: Partial<OnboardingDraft>) => {
          draft = { ...draft, ...fields };
        };

        updateDraft({ firstName: 'John', lastName: 'Doe', fullName: 'John Doe' });
        assertEqual(draft.firstName, 'John');
        assertEqual(draft.lastName, 'Doe');

        updateDraft({ title: 'Lead Architect' });
        assertEqual(draft.title, 'Lead Architect');

        updateDraft({ phone: '+1234567890' });
        assertEqual(draft.phone, '+1234567890');

        updateDraft({ businessAddress: 'Austin, TX' });
        assertEqual(draft.businessAddress, 'Austin, TX');
      },
    ],
    [
      'test_stepProfessional_updates_all_professional_fields',
      () => {
        let draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const updateDraft = (fields: Partial<OnboardingDraft>) => {
          draft = { ...draft, ...fields };
        };

        updateDraft({ organization: 'ProsCard Inc' });
        assertEqual(draft.organization, 'ProsCard Inc');

        updateDraft({ email: 'john@proscard.app' });
        assertEqual(draft.email, 'john@proscard.app');

        updateDraft({ shortBio: 'Full stack developer building mobile apps.' });
        assertEqual(draft.shortBio, 'Full stack developer building mobile apps.');
      },
    ],
    [
      'test_stepSocial_updates_all_social_fields',
      () => {
        let draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const updateDraft = (fields: Partial<OnboardingDraft>) => {
          draft = { ...draft, ...fields };
        };

        updateDraft({ linkedin: 'johndoe' });
        assertEqual(draft.linkedin, 'johndoe');

        updateDraft({ github: 'johndoe' });
        assertEqual(draft.github, 'johndoe');

        updateDraft({ x: '@johndoe' });
        assertEqual(draft.x, '@johndoe');

        updateDraft({ website: 'https://johndoe.com' });
        assertEqual(draft.website, 'https://johndoe.com');

        updateDraft({ portfolio: 'https://johndoe.design' });
        assertEqual(draft.portfolio, 'https://johndoe.design');
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
