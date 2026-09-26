// components/onboardingComponents/Hooks/useOnboardingStepper.stress.test.ts
import React, { act } from 'react';
import type { UseOnboardingStepperReturn } from '../types/onboardingStepper.types';
import { INITIAL_ONBOARDING_DRAFT } from '../types/onboardingStepper.types';
import {
  ONBOARDING_FLOW,
  type OnboardingFlowGroupId,
} from '../types/onboardingFlow.types';

async function advanceToGroup(
  getHook: () => UseOnboardingStepperReturn,
  groupId: OnboardingFlowGroupId
) {
  for (let i = 0; i < ONBOARDING_FLOW.length * 2; i++) {
    const item = getHook().currentItem;
    if (item.kind === 'group' && item.groupId === groupId) return;
    await act(async () => {
      getHook().nextStep();
    });
  }
  throw new Error(`Could not reach group screen for ${groupId}`);
}

async function advanceThroughMandatoryIdentity(
  getHook: () => UseOnboardingStepperReturn
) {
  await act(async () => {
    getHook().nextStep();
  });
  await advanceToGroup(getHook, 'name_legal');
  await act(async () => {
    getHook().updateDraft({
      firstName: 'Ada',
      lastName: 'Lovelace',
      fullName: 'Ada Lovelace',
    });
    getHook().nextStep();
  });
  await advanceToGroup(getHook, 'role_company');
  await act(async () => {
    getHook().updateDraft({ title: 'Engineer', organization: 'Analytical Engines' });
    getHook().nextStep();
  });
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export interface HarnessContext {
  useOnboardingStepper: () => UseOnboardingStepperReturn;
  createRoot: (container: any) => any;
  MockNode: new (tag?: string) => any;
  mockStorage: {
    getItem: (k: string) => Promise<string | null>;
    setItem: (k: string, v: string) => Promise<void>;
    removeItem: (k: string) => Promise<void>;
    clear: () => Promise<void>;
    failNextSetItem?: boolean;
  };
  routerEvents: { action: string; path?: string }[];
  hapticsEvents: any[];
}

export async function runStepperStressTests(
  ctx: HarnessContext
): Promise<{ passed: number; failed: number; errors: { test: string; error: string }[] }> {
  const { useOnboardingStepper, createRoot, MockNode, mockStorage, routerEvents } = ctx;
  let passed = 0;
  let failed = 0;
  const errors: { test: string; error: string }[] = [];

  // Helper to mount fresh hook instance
  async function mountHook(): Promise<{
    getHook: () => UseOnboardingStepperReturn;
    unmount: () => Promise<void>;
  }> {
    let hookState!: UseOnboardingStepperReturn;
    function TestComponent() {
      hookState = useOnboardingStepper();
      return null;
    }

    const container = new MockNode('DIV');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    // Wait for initial hydration effect
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    return {
      getHook: () => hookState,
      unmount: async () => {
        await act(async () => {
          root.unmount();
        });
      },
    };
  }

  const testCases: [string, () => Promise<void>][] = [
    [
      'STRESS-STEP-01: Initial state starts on welcome with flow index 0',
      async () => {
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          const h = getHook();
          assertEqual(h.flowIndex, 0, 'Initial flowIndex must be 0');
          assertEqual(h.currentItem.kind, 'welcome', 'Initial screen must be welcome');
          assertEqual(h.totalSteps, ONBOARDING_FLOW.length, 'totalSteps must match flow length');
          assertEqual(h.canGoBack, false, 'canGoBack must be false on welcome');
          assertEqual(h.isLastStep, false, 'isLastStep must be false on welcome');
          assertEqual(h.isSaving, false, 'isSaving must be false initially');
          assertEqual(Object.keys(h.errors).length, 0, 'errors must be empty initially');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-02: Welcome nextStep advances to first group card',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          let res = false;
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, true, 'nextStep on welcome must succeed');
          assertEqual(getHook().currentItem.kind, 'group', 'Must advance to first group card');
          assertEqual(getHook().canGoBack, true, 'canGoBack must be true after welcome');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-03: name_legal answer validation blocks empty names',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().nextStep();
          });
          await advanceToGroup(getHook, 'name_legal');

          await act(async () => {
            getHook().updateDraft({ firstName: '', lastName: '', fullName: '' });
          });

          let res = true;
          await act(async () => {
            res = getHook().nextStep();
          });

          assertEqual(res, false, 'nextStep must fail when name fields are empty');
          assert(Boolean(getHook().errors.firstName), 'errors.firstName must be set');

          await act(async () => {
            getHook().updateDraft({ firstName: 'Ada', lastName: '', fullName: 'Ada' });
          });
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, false, 'nextStep must fail when lastName missing');
          assert(Boolean(getHook().errors.lastName), 'errors.lastName must be set');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-04: Real-time error clearing: updating field clears its specific error immediately',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().nextStep();
          });
          await advanceToGroup(getHook, 'name_legal');
          await act(async () => {
            getHook().updateDraft({ firstName: '', lastName: '', fullName: '' });
          });

          await act(async () => {
            getHook().nextStep();
          });
          assert(Boolean(getHook().errors.firstName), 'firstName error present');
          assert(Boolean(getHook().errors.lastName), 'lastName error present');

          await act(async () => {
            getHook().updateDraft({ firstName: 'Ada', fullName: 'Ada' });
          });

          assertEqual(getHook().errors.firstName, undefined, 'firstName error must be cleared');
          assert(Boolean(getHook().errors.lastName), 'lastName error must still remain');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-05: contact_email answer validates email',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await advanceThroughMandatoryIdentity(getHook);
          await advanceToGroup(getHook, 'contact_email');

          await act(async () => {
            getHook().updateDraft({ email: '' });
          });
          let res = true;
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, false, 'nextStep must fail when email is empty');
          assert(Boolean(getHook().errors.email), 'errors.email must be set');

          await act(async () => {
            getHook().updateDraft({ email: 'notanemail' });
          });
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, false, 'nextStep must fail on invalid email format');

          await act(async () => {
            getHook().updateDraft({ email: 'ada@lovelace.org' });
          });
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, true, 'nextStep must succeed with valid email');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-06: presence answer is optional and advances to card_style when empty',
      async () => {
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().goToStep(4);
          });
          await advanceToGroup(getHook, 'presence');

          await act(async () => {
            getHook().updateDraft({
              linkedin: '',
              github: '',
              x: '',
              facebook: '',
              instagram: '',
              whatsapp: '',
              youtube: '',
              tiktok: '',
              portfolio: '',
              photoUrl: '',
              coverPhotoUrl: '',
            });
          });

          let res = false;
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, true, 'Optional presence must advance');
          assertEqual(getHook().currentItem.kind, 'card_style', 'Must arrive at card_style');
          assertEqual(getHook().isLastStep, true, 'isLastStep must be true on card_style');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-07: nextStep on card_style does not advance past last flow item',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().goToStep(5);
          });
          assertEqual(getHook().currentItem.kind, 'card_style');

          const before = getHook().flowIndex;
          await act(async () => {
            getHook().nextStep();
          });
          assertEqual(getHook().flowIndex, before, 'flowIndex must not exceed last item');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-08: prevStep walks back one flow index and stops at welcome',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().goToStep(4);
          });
          const startIndex = getHook().flowIndex;

          await act(async () => {
            getHook().prevStep();
          });
          assertEqual(getHook().flowIndex, startIndex - 1);

          while (getHook().flowIndex > 0) {
            await act(async () => {
              getHook().prevStep();
            });
          }
          assertEqual(getHook().flowIndex, 0);
          assertEqual(getHook().canGoBack, false);

          await act(async () => {
            getHook().prevStep();
            getHook().prevStep();
          });
          assertEqual(getHook().flowIndex, 0, 'flowIndex must never underflow below 0');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-09: goToStep boundary checks: 0, 6, -1, NaN, floats',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().goToStep(3);
          });
          const indexAt3 = getHook().flowIndex;
          assertEqual(getHook().currentStep, 3);

          await act(async () => {
            getHook().goToStep(0);
          });
          assertEqual(getHook().flowIndex, indexAt3, 'goToStep(0) must be ignored');

          await act(async () => {
            getHook().goToStep(6);
          });
          assertEqual(getHook().flowIndex, indexAt3, 'goToStep(6) must be ignored');

          await act(async () => {
            getHook().goToStep(-5);
          });
          assertEqual(getHook().flowIndex, indexAt3, 'goToStep(-5) must be ignored');

          await act(async () => {
            getHook().goToStep(1);
          });
          assertEqual(getHook().flowIndex, 0, 'Backward jump to welcome must succeed');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-10: Skip advances optional groups and skips paired answer',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().nextStep();
          });
          await advanceToGroup(getHook, 'name_legal');
          await act(async () => {
            getHook().updateDraft({
              firstName: 'Ada',
              lastName: 'Lovelace',
              fullName: 'Ada Lovelace',
              title: 'Engineer',
              organization: 'Analytical Engines',
            });
            getHook().nextStep();
          });
          await advanceToGroup(getHook, 'credentials');

          await act(async () => {
            getHook().skipStep();
          });
          const item0 = getHook().currentItem;
          assertEqual(
            item0.kind === 'group' ? item0.groupId : null,
            'tagline',
            'skip credentials must land on tagline group'
          );

          await act(async () => {
            getHook().skipStep();
          });
          const item1 = getHook().currentItem;
          assertEqual(item1.kind, 'group', 'skip must land on next group card');
          assertEqual(
            item1.kind === 'group' ? item1.groupId : null,
            'contact_email',
            'skip tagline must land on contact_email group'
          );
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-11: Draft fields retained when navigating back and jumping to card_style',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({
              firstName: 'Grace',
              lastName: 'Hopper',
              fullName: 'Grace Hopper',
              title: 'Rear Admiral',
              organization: 'US Navy',
              email: 'grace@navy.mil',
              phone: '+1 (555) 000-1111',
              businessAddress: 'Arlington, VA',
              shortBio: 'Pioneer in computer programming',
              website: 'navy.mil/hopper',
              github: 'ghopper',
              linkedin: 'gracehopper',
              cardCategory: 'Business',
              cardGradient: ['#111827', '#020617'],
            });
            getHook().goToStep(5);
          });

          await act(async () => {
            getHook().goToStep(2);
          });
          const item11 = getHook().currentItem;
          assertEqual(item11.kind, 'group');
          assertEqual(
            item11.kind === 'group' ? item11.groupId : null,
            'name_legal'
          );

          let d = getHook().draft;
          assertEqual(d.fullName, 'Grace Hopper');
          assertEqual(d.title, 'Rear Admiral');
          assertEqual(d.phone, '+1 (555) 000-1111');
          assertEqual(d.organization, 'US Navy');
          assertEqual(d.email, 'grace@navy.mil');
          assertEqual(d.github, 'ghopper');
          assertEqual(d.cardCategory, 'Business');

          await act(async () => {
            getHook().goToStep(5);
          });
          d = getHook().draft;
          assertEqual(d.fullName, 'Grace Hopper');
          assertEqual(d.email, 'grace@navy.mil');
          assertEqual(d.github, 'ghopper');
          assertEqual(d.cardCategory, 'Business');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-12: finalizeOnboarding blocks incomplete drafts and kicks back to first invalid step',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          // Go to Step 5 with empty required fields
          await act(async () => {
            getHook().updateDraft({ firstName: '', lastName: '', fullName: '', title: '', email: '' });
          });

          let result = true;
          await act(async () => {
            result = await getHook().finalizeOnboarding();
          });

          assertEqual(result, false, 'finalizeOnboarding must return false for incomplete draft');
          const item12 = getHook().currentItem;
          assertEqual(item12.kind, 'group', 'Must route to group card for first error');
          assertEqual(
            item12.kind === 'group' ? item12.groupId : null,
            'name_legal',
            'Must kick back to name_legal group'
          );
          assert(Boolean(getHook().errors.firstName), 'errors.firstName must be set');
          assertEqual(getHook().isSaving, false, 'isSaving must reset to false');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-13: finalizeOnboarding succeeds with complete draft, persists, and redirects',
      async () => {
        routerEvents.length = 0;
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 80));
          });
          await act(async () => {
            getHook().updateDraft({
              ...INITIAL_ONBOARDING_DRAFT,
              firstName: 'Katherine',
              lastName: 'Johnson',
              fullName: 'Katherine Johnson',
              title: 'Mathematician',
              email: 'katherine@nasa.gov',
              organization: 'NASA',
              cardCategory: 'Professional',
              cardGradient: ['#2563eb', '#00a8e8'],
            });
            getHook().goToStep(5);
          });

          let result = false;
          await act(async () => {
            result = await getHook().finalizeOnboarding();
          });

          assertEqual(result, true, 'finalizeOnboarding must return true on success');
          assertEqual(getHook().isSaving, false, 'isSaving must reset to false');

          // Verify redirect happened
          const redirect = routerEvents.find((e) => e.path === '/(tabs)/homepage');
          assert(Boolean(redirect), 'router.replace must be called with /(tabs)/homepage');

          // Verify persistence in AsyncStorage
          const profileRaw = await mockStorage.getItem('userProfile');
          assert(Boolean(profileRaw), 'userProfile must be persisted in storage');
          const savedProfile = JSON.parse(profileRaw!);
          assertEqual(savedProfile.fullName, 'Katherine Johnson');

          const flagRaw = await mockStorage.getItem('hasCompletedOnboarding');
          assertEqual(flagRaw, 'true', 'hasCompletedOnboarding must be set to true');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-14: goToStep boundary resilience against NaN and non-integer inputs',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          assertEqual(getHook().flowIndex, 0);
          await act(async () => {
            getHook().goToStep(NaN as any);
          });
          assertEqual(getHook().flowIndex, 0, 'flowIndex must stay 0 when goToStep(NaN)');

          await act(async () => {
            getHook().goToStep(2.5 as any);
          });
          assertEqual(getHook().flowIndex, 0, 'flowIndex must ignore non-integer goToStep');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-15: goToStep can jump to presence from welcome without validating intermediate groups',
      async () => {
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          assertEqual(getHook().flowIndex, 0);
          await act(async () => {
            getHook().goToStep(4);
          });
          const item15 = getHook().currentItem;
          assertEqual(
            item15.kind === 'group' ? item15.groupId : null,
            'presence'
          );
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-16: Concurrent rapid step navigation stress',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().nextStep();
            getHook().updateDraft({
              firstName: 'Rapid',
              lastName: 'User',
              fullName: 'Rapid User',
            });
            getHook().nextStep();
          });
          assert(getHook().flowIndex > 0, 'flowIndex must advance');
          assert(getHook().currentStep >= 1 && getHook().currentStep <= 5, 'legacy step bucket in [1, 5]');
        } finally {
          await unmount();
        }
      },
    ],
  ];

  for (const [name, fn] of testCases) {
    try {
      await fn();
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ test: name, error: msg });
      failed++;
    }
  }

  return { passed, failed, errors };
}
