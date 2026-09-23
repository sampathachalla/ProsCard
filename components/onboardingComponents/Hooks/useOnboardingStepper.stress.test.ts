// components/onboardingComponents/Hooks/useOnboardingStepper.stress.test.ts
import React, { act } from 'react';
import type { UseOnboardingStepperReturn } from '../types/onboardingStepper.types';

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
      'STRESS-STEP-01: Initial state starts on Step 1 with correct defaults and metadata',
      async () => {
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          const h = getHook();
          assertEqual(h.currentStep, 1, 'Initial currentStep must be 1');
          assertEqual(h.totalSteps, 5, 'totalSteps must be 5');
          assertEqual(h.canGoBack, false, 'canGoBack must be false on step 1');
          assertEqual(h.isLastStep, false, 'isLastStep must be false on step 1');
          assertEqual(h.isSaving, false, 'isSaving must be false initially');
          assertEqual(Object.keys(h.errors).length, 0, 'errors must be empty initially');
          assertEqual(h.activeStepMeta?.title, 'Welcome', 'Step 1 title must be Welcome');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-02: Step 1 nextStep advances to Step 2 unconditionally',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          let res = false;
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, true, 'nextStep on Step 1 must succeed');
          assertEqual(getHook().currentStep, 2, 'Must advance to Step 2');
          assertEqual(getHook().canGoBack, true, 'canGoBack must be true on Step 2');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-03: Step 2 validation blocks advancing when fullName is empty or invalid',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          // Go to Step 2
          await act(async () => { getHook().nextStep(); });
          assertEqual(getHook().currentStep, 2);

          // Clear fullName
          await act(async () => {
            getHook().updateDraft({ fullName: '' });
          });

          // Attempt to advance
          let res = true;
          await act(async () => {
            res = getHook().nextStep();
          });

          assertEqual(res, false, 'nextStep must fail when fullName is empty');
          assertEqual(getHook().currentStep, 2, 'Must stay on Step 2');
          assert(Boolean(getHook().errors.fullName), 'errors.fullName must be set');

          // Try 1 char name
          await act(async () => {
            getHook().updateDraft({ fullName: 'A' });
          });
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, false, 'nextStep must fail when fullName < 2 chars');
          assertEqual(getHook().currentStep, 2);
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
          // Step 1 -> Step 2
          await act(async () => { getHook().nextStep(); });
          await act(async () => { getHook().updateDraft({ fullName: '', phone: '123' }); });

          // Trigger errors on both fullName and phone
          await act(async () => { getHook().nextStep(); });
          assert(Boolean(getHook().errors.fullName), 'fullName error present');
          assert(Boolean(getHook().errors.phone), 'phone error present');

          // Update ONLY fullName
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace' });
          });

          // fullName error must be cleared, phone error must remain
          assertEqual(getHook().errors.fullName, undefined, 'fullName error must be cleared');
          assert(Boolean(getHook().errors.phone), 'phone error must still remain');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-05: Step 3 validation blocks advancing when workEmail is empty or invalid',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          // Step 1 -> Step 2
          await act(async () => { getHook().nextStep(); });
          // Provide valid Step 2
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', phone: '' });
          });
          // Step 2 -> Step 3
          await act(async () => { getHook().nextStep(); });
          assertEqual(getHook().currentStep, 3, 'Must be on Step 3');

          // Empty email
          await act(async () => { getHook().updateDraft({ workEmail: '' }); });
          let res = true;
          await act(async () => { res = getHook().nextStep(); });
          assertEqual(res, false, 'nextStep must fail when workEmail is empty');
          assertEqual(getHook().currentStep, 3);
          assert(Boolean(getHook().errors.workEmail), 'errors.workEmail must be set');

          // Invalid email
          await act(async () => { getHook().updateDraft({ workEmail: 'notanemail' }); });
          await act(async () => { res = getHook().nextStep(); });
          assertEqual(res, false, 'nextStep must fail on invalid email format');
          assertEqual(getHook().currentStep, 3);

          // Valid email
          await act(async () => { getHook().updateDraft({ workEmail: 'ada@lovelace.org' }); });
          await act(async () => { res = getHook().nextStep(); });
          assertEqual(res, true, 'nextStep must succeed with valid email');
          assertEqual(getHook().currentStep, 4, 'Must advance to Step 4');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-06: Step 4 is optional and advances to Step 5 even when empty',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', workEmail: 'ada@lovelace.org' });
            getHook().goToStep(4);
          });
          assertEqual(getHook().currentStep, 4);

          let res = false;
          await act(async () => {
            res = getHook().nextStep();
          });
          assertEqual(res, true, 'Optional Step 4 must advance');
          assertEqual(getHook().currentStep, 5, 'Must arrive at Step 5');
          assertEqual(getHook().isLastStep, true, 'isLastStep must be true on Step 5');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-07: Calling nextStep on Step 5 does not increment beyond totalSteps',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', workEmail: 'ada@lovelace.org' });
            getHook().goToStep(5);
          });
          assertEqual(getHook().currentStep, 5);

          await act(async () => {
            getHook().nextStep();
          });
          assertEqual(getHook().currentStep, 5, 'currentStep must not exceed 5');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-08: prevStep traverses backward and stops at Step 1 boundary without underflow',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', workEmail: 'ada@lovelace.org' });
            getHook().goToStep(4);
          });
          assertEqual(getHook().currentStep, 4);

          await act(async () => { getHook().prevStep(); });
          assertEqual(getHook().currentStep, 3);

          await act(async () => { getHook().prevStep(); });
          assertEqual(getHook().currentStep, 2);

          await act(async () => { getHook().prevStep(); });
          assertEqual(getHook().currentStep, 1);
          assertEqual(getHook().canGoBack, false);

          // Underflow test: rapid calls on Step 1
          await act(async () => {
            getHook().prevStep();
            getHook().prevStep();
            getHook().prevStep();
          });
          assertEqual(getHook().currentStep, 1, 'currentStep must never underflow below 1');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-09: Direct step jump (goToStep) boundary checks: 0, 6, -1, NaN, floats',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', workEmail: 'ada@lovelace.org' });
            getHook().goToStep(3);
          });
          assertEqual(getHook().currentStep, 3);

          // Test boundary: 0
          await act(async () => { getHook().goToStep(0); });
          assertEqual(getHook().currentStep, 3, 'goToStep(0) must be ignored');

          // Test boundary: 6
          await act(async () => { getHook().goToStep(6); });
          assertEqual(getHook().currentStep, 3, 'goToStep(6) must be ignored');

          // Test boundary: -5
          await act(async () => { getHook().goToStep(-5); });
          assertEqual(getHook().currentStep, 3, 'goToStep(-5) must be ignored');

          // Test boundary: same step
          await act(async () => { getHook().goToStep(3); });
          assertEqual(getHook().currentStep, 3, 'goToStep(current) must be no-op');

          // Test backward jump
          await act(async () => { getHook().goToStep(1); });
          assertEqual(getHook().currentStep, 1, 'Backward jump to 1 must succeed');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-10: Skip step logic: Step 1 skips to 2, Step 4 skips to 5, Step 2/3 trigger validation',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          // On Step 1: skip goes to Step 2
          assertEqual(getHook().currentStep, 1);
          await act(async () => { getHook().skipStep(); });
          assertEqual(getHook().currentStep, 2, 'Step 1 skipStep must advance to Step 2');

          // On Step 2: mandatory! skipStep should invoke validation and fail
          await act(async () => {
            getHook().updateDraft({ fullName: '' });
          });
          await act(async () => { getHook().skipStep(); });
          assertEqual(getHook().currentStep, 2, 'Step 2 skipStep must NOT skip mandatory step');
          assert(Boolean(getHook().errors.fullName), 'fullName error must be triggered on skip attempt');

          // Provide valid Step 2 & 3, go to Step 4
          await act(async () => {
            getHook().updateDraft({ fullName: 'Ada Lovelace', workEmail: 'ada@lovelace.org' });
          });
          await act(async () => {
            getHook().goToStep(4);
          });
          assertEqual(getHook().currentStep, 4);

          // On Step 4: optional! skipStep should advance to Step 5
          await act(async () => { getHook().skipStep(); });
          assertEqual(getHook().currentStep, 5, 'Step 4 skipStep must advance to Step 5');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-11: Data retention: All inputs across steps 2, 3, 4, 5 are preserved during back & forth traversal',
      async () => {
        const { getHook, unmount } = await mountHook();
        try {
          // Step 1 -> Step 2
          await act(async () => { getHook().nextStep(); });

          // Fill Step 2
          await act(async () => {
            getHook().updateDraft({
              fullName: 'Grace Hopper',
              title: 'Rear Admiral',
              phone: '+1 (555) 000-1111',
              location: 'Arlington, VA',
            });
          });

          // Step 2 -> Step 3
          await act(async () => { getHook().nextStep(); });

          // Fill Step 3
          await act(async () => {
            getHook().updateDraft({
              organization: 'US Navy',
              workEmail: 'grace@navy.mil',
              shortBio: 'Pioneer in computer programming',
            });
          });

          // Step 3 -> Step 4
          await act(async () => { getHook().nextStep(); });

          // Fill Step 4
          await act(async () => {
            getHook().updateDraft({
              github: 'ghopper',
              linkedin: 'gracehopper',
              website: 'navy.mil/hopper',
            });
          });

          // Step 4 -> Step 5
          await act(async () => { getHook().nextStep(); });

          // Fill Step 5
          await act(async () => {
            getHook().updateDraft({
              cardCategory: 'Business',
              cardGradient: ['#111827', '#020617'],
            });
          });

          // Now navigate BACKWARD all the way to Step 2
          await act(async () => { getHook().prevStep(); }); // to 4
          await act(async () => { getHook().prevStep(); }); // to 3
          await act(async () => { getHook().prevStep(); }); // to 2
          assertEqual(getHook().currentStep, 2);

          // Verify Step 2 fields retained
          let d = getHook().draft;
          assertEqual(d.fullName, 'Grace Hopper');
          assertEqual(d.title, 'Rear Admiral');
          assertEqual(d.phone, '+1 (555) 000-1111');
          assertEqual(d.location, 'Arlington, VA');

          // Verify Step 3, 4, 5 data is ALSO retained while on Step 2
          assertEqual(d.organization, 'US Navy');
          assertEqual(d.workEmail, 'grace@navy.mil');
          assertEqual(d.shortBio, 'Pioneer in computer programming');
          assertEqual(d.github, 'ghopper');
          assertEqual(d.cardCategory, 'Business');
          assertEqual(d.cardGradient[0], '#111827');

          // Navigate FORWARD back to Step 5
          await act(async () => { getHook().goToStep(5); });
          assertEqual(getHook().currentStep, 5);

          d = getHook().draft;
          assertEqual(d.fullName, 'Grace Hopper');
          assertEqual(d.workEmail, 'grace@navy.mil');
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
            getHook().updateDraft({ fullName: '', workEmail: '' });
          });

          let result = true;
          await act(async () => {
            result = await getHook().finalizeOnboarding();
          });

          assertEqual(result, false, 'finalizeOnboarding must return false for incomplete draft');
          assertEqual(getHook().currentStep, 2, 'Must kick back to Step 2 (firstErrorStep)');
          assert(Boolean(getHook().errors.fullName), 'errors.fullName must be set');
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
        const { getHook, unmount } = await mountHook();
        try {
          await act(async () => {
            getHook().updateDraft({
              fullName: 'Katherine Johnson',
              title: 'Mathematician',
              workEmail: 'katherine@nasa.gov',
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
          assertEqual(getHook().currentStep, 1);
          // Try NaN
          await act(async () => {
            getHook().goToStep(NaN as any);
          });
          assert(!Number.isNaN(getHook().currentStep), 'currentStep must not become NaN when goToStep(NaN) is called');
          assertEqual(getHook().currentStep, 1, 'currentStep should remain 1');

          // Try float 2.5
          await act(async () => {
            getHook().goToStep(2.5 as any);
          });
          assert(Number.isInteger(getHook().currentStep), 'currentStep must remain an integer');
        } finally {
          await unmount();
        }
      },
    ],
    [
      'STRESS-STEP-15: Forward jump validation: jumping over uncompleted mandatory steps',
      async () => {
        await mockStorage.clear();
        const { getHook, unmount } = await mountHook();
        try {
          assertEqual(getHook().currentStep, 1);
          assertEqual(getHook().draft.fullName, '');

          // Attempt to jump forward to Step 4 directly from Step 1 with empty mandatory fields
          await act(async () => {
            getHook().goToStep(4);
          });

          // Forward jump validation:
          // Must halt at first invalid step (Step 2) rather than jumping to Step 4
          const stepAfterJump = getHook().currentStep;
          assertEqual(stepAfterJump, 2, 'Halts transition at first invalid step (Step 2)');
          assert(Boolean(getHook().errors.fullName), 'Errors must be set on first invalid step');
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
          // Fire multiple rapid updates and jumps
          await act(async () => {
            getHook().nextStep();
            getHook().updateDraft({ fullName: 'Rapid User' });
            getHook().nextStep();
          });
          // State should be internally coherent
          assert(getHook().currentStep >= 1 && getHook().currentStep <= 5, 'Step must stay within [1, 5]');
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
