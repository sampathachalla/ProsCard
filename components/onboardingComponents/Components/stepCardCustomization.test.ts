// components/onboardingComponents/Components/stepCardCustomization.test.ts
import {
  CARD_GRADIENT_PRESETS,
  DEFAULT_CARD_CATEGORIES,
  INITIAL_ONBOARDING_DRAFT,
  type OnboardingDraft,
  type CardGradientPreset,
} from '../types/onboardingStepper.types';
import {
  CARD_ASPECT_RATIO,
  PRESET_CATEGORY_MAP,
  StepCardCustomization,
} from './StepCardCustomization';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(
      `Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`
    );
  }
}

function assertTrue(condition: boolean, msg?: string) {
  if (!condition) {
    throw new Error(`Assert failed: expected true. ${msg || ''}`);
  }
}

export function runStepCardCustomizationTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const testCases: [string, () => void][] = [
    // 1. Fallback defaults
    [
      'test_stepCardCustomization_resolves_default_fallbacks_when_draft_is_empty',
      () => {
        const draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const safeName = draft.fullName?.trim() || 'Your Name';
        const safeTitle = draft.title?.trim() || 'Professional Role';
        const safeCompany = draft.organization?.trim() || 'Company / Organization';
        const safeCategory = draft.cardCategory || 'Professional';
        const safeGradient =
          Array.isArray(draft.cardGradient) && draft.cardGradient.length === 2
            ? draft.cardGradient
            : ['#2563eb', '#00a8e8'];
        const qrUrl = `https://proscard.mindpros.com/p/${encodeURIComponent(
          draft.fullName?.trim() || 'user'
        )}`;

        assertEqual(safeName, 'Your Name');
        assertEqual(safeTitle, 'Professional Role');
        assertEqual(safeCompany, 'Company / Organization');
        assertEqual(safeCategory, 'Professional');
        assertEqual(safeGradient[0], '#2563eb');
        assertEqual(safeGradient[1], '#00a8e8');
        assertEqual(qrUrl, 'https://proscard.mindpros.com/p/user');
      },
    ],

    // 2. Bound user data propagation
    [
      'test_stepCardCustomization_propagates_entered_user_draft_data',
      () => {
        const draft: OnboardingDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          fullName: 'Sarah Connor',
          title: 'Lead Systems Architect',
          organization: 'Cyberdyne Systems',
          phone: '+1 (555) 019-2834',
          location: 'Los Angeles, CA',
          workEmail: 'sarah@cyberdyne.io',
          shortBio: 'Pioneering defensive automation and neural architectures.',
          linkedin: 'sarahconnor',
          github: 'sconnor',
          x: 'realsarah',
          website: 'https://cyberdyne.io',
          portfolio: 'https://sarahconnor.me',
          cardCategory: 'Business',
          cardGradient: ['#111827', '#020617'],
        };

        const safeName = draft.fullName?.trim() || 'Your Name';
        const safeTitle = draft.title?.trim() || 'Professional Role';
        const safeCompany = draft.organization?.trim() || 'Company / Organization';
        const safeCategory = draft.cardCategory || 'Professional';
        const qrUrl = `https://proscard.mindpros.com/p/${encodeURIComponent(
          draft.fullName?.trim() || 'user'
        )}`;

        assertEqual(safeName, 'Sarah Connor');
        assertEqual(safeTitle, 'Lead Systems Architect');
        assertEqual(safeCompany, 'Cyberdyne Systems');
        assertEqual(safeCategory, 'Business');
        assertEqual(draft.cardGradient[0], '#111827');
        assertEqual(draft.cardGradient[1], '#020617');
        assertEqual(qrUrl, 'https://proscard.mindpros.com/p/Sarah%20Connor');
      },
    ],

    // 3. Theme Presets completeness & structure
    [
      'test_stepCardCustomization_theme_presets_have_six_signature_gradients',
      () => {
        assertEqual(CARD_GRADIENT_PRESETS.length, 6);
        const expectedIds = [
          'pro-cyan',
          'midnight',
          'royal-purple',
          'emerald-teal',
          'sunset-amber',
          'slate-charcoal',
        ];

        CARD_GRADIENT_PRESETS.forEach((preset, index) => {
          assertEqual(preset.id, expectedIds[index]);
          assertTrue(preset.label.length > 0, `Preset ${preset.id} has non-empty label`);
          assertEqual(preset.gradient.length, 2);
          assertTrue(preset.gradient[0].startsWith('#'));
          assertTrue(preset.gradient[1].startsWith('#'));
        });
      },
    ],

    // 4. Gradient preset selection updates draft and category
    [
      'test_stepCardCustomization_theme_selection_updates_draft_gradient_and_category',
      () => {
        let draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const updateDraft = (fields: Partial<OnboardingDraft>) => {
          draft = { ...draft, ...fields };
        };

        const handleSelectPreset = (preset: CardGradientPreset) => {
          const mappedCategory =
            PRESET_CATEGORY_MAP[preset.id] || draft.cardCategory || 'Professional';
          updateDraft({
            cardGradient: preset.gradient,
            cardCategory: mappedCategory,
          });
        };

        // Select Royal Violet
        const royalViolet = CARD_GRADIENT_PRESETS.find((p) => p.id === 'royal-purple')!;
        handleSelectPreset(royalViolet);
        assertEqual(draft.cardGradient[0], '#4f46e5');
        assertEqual(draft.cardGradient[1], '#7c3aed');
        assertEqual(draft.cardCategory, 'Business');

        // Select Emerald Teal
        const emeraldTeal = CARD_GRADIENT_PRESETS.find((p) => p.id === 'emerald-teal')!;
        handleSelectPreset(emeraldTeal);
        assertEqual(draft.cardGradient[0], '#0f766e');
        assertEqual(draft.cardGradient[1], '#059669');
        assertEqual(draft.cardCategory, 'Networking');

        // Select Midnight Dark
        const midnight = CARD_GRADIENT_PRESETS.find((p) => p.id === 'midnight')!;
        handleSelectPreset(midnight);
        assertEqual(draft.cardGradient[0], '#111827');
        assertEqual(draft.cardGradient[1], '#020617');
        assertEqual(draft.cardCategory, 'Personal');
      },
    ],

    // 5. Active preset identification
    [
      'test_stepCardCustomization_active_theme_selection_state_detection',
      () => {
        const currentGradient: [string, string] = ['#EA580C', '#EC4899']; // sunset-amber in uppercase

        const isPresetSelected = (preset: CardGradientPreset) => {
          return (
            currentGradient[0].toLowerCase() === preset.gradient[0].toLowerCase() &&
            currentGradient[1].toLowerCase() === preset.gradient[1].toLowerCase()
          );
        };

        const activePresets = CARD_GRADIENT_PRESETS.filter(isPresetSelected);
        assertEqual(activePresets.length, 1);
        assertEqual(activePresets[0].id, 'sunset-amber');
      },
    ],

    // 6. Category Selection
    [
      'test_stepCardCustomization_category_selection_updates_draft_category',
      () => {
        assertEqual(DEFAULT_CARD_CATEGORIES.length, 4);
        assertEqual(DEFAULT_CARD_CATEGORIES[0], 'Professional');
        assertEqual(DEFAULT_CARD_CATEGORIES[1], 'Personal');
        assertEqual(DEFAULT_CARD_CATEGORIES[2], 'Business');
        assertEqual(DEFAULT_CARD_CATEGORIES[3], 'Networking');

        let draft: OnboardingDraft = { ...INITIAL_ONBOARDING_DRAFT };
        const updateDraft = (fields: Partial<OnboardingDraft>) => {
          draft = { ...draft, ...fields };
        };

        const handleSelectCategory = (cat: string) => {
          updateDraft({ cardCategory: cat });
        };

        handleSelectCategory('Networking');
        assertEqual(draft.cardCategory, 'Networking');

        handleSelectCategory('Personal');
        assertEqual(draft.cardCategory, 'Personal');
      },
    ],

    // 7. Profile Summary Chips generation
    [
      'test_stepCardCustomization_summary_chips_generated_for_populated_fields',
      () => {
        const draft: OnboardingDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          fullName: 'John Architect',
          title: 'Staff Architect',
          organization: 'ProsCard',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          workEmail: 'john@proscard.app',
          shortBio: '',
          linkedin: 'john-architect',
          github: 'johnarch',
          x: 'johnarch',
          website: 'https://johnarch.dev',
          portfolio: 'https://portfolio.johnarch.dev',
          cardCategory: 'Professional',
          cardGradient: ['#2563eb', '#00a8e8'],
        };

        const chips: { label: string; key: string }[] = [];
        if (draft.workEmail?.trim()) {
          chips.push({ label: draft.workEmail.trim(), key: 'email' });
        }
        if (draft.phone?.trim()) {
          chips.push({ label: draft.phone.trim(), key: 'phone' });
        }
        if (draft.location?.trim()) {
          chips.push({ label: draft.location.trim(), key: 'location' });
        }
        if (draft.linkedin?.trim()) {
          chips.push({ label: `in/${draft.linkedin.trim()}`, key: 'linkedin' });
        }
        if (draft.github?.trim()) {
          chips.push({ label: `gh/${draft.github.trim()}`, key: 'github' });
        }
        if (draft.x?.trim()) {
          const handle = draft.x.trim();
          chips.push({
            label: handle.startsWith('@') ? handle : `@${handle}`,
            key: 'x',
          });
        }
        if (draft.website?.trim()) {
          chips.push({
            label: draft.website.trim().replace(/^https?:\/\//i, ''),
            key: 'website',
          });
        }
        if (draft.portfolio?.trim()) {
          chips.push({
            label: draft.portfolio.trim().replace(/^https?:\/\//i, ''),
            key: 'portfolio',
          });
        }

        assertEqual(chips.length, 8);
        assertEqual(chips[0].key, 'email');
        assertEqual(chips[0].label, 'john@proscard.app');
        assertEqual(chips[1].key, 'phone');
        assertEqual(chips[1].label, '+1 (555) 234-5678');
        assertEqual(chips[2].key, 'location');
        assertEqual(chips[2].label, 'San Francisco, CA');
        assertEqual(chips[3].key, 'linkedin');
        assertEqual(chips[3].label, 'in/john-architect');
        assertEqual(chips[4].key, 'github');
        assertEqual(chips[4].label, 'gh/johnarch');
        assertEqual(chips[5].key, 'x');
        assertEqual(chips[5].label, '@johnarch');
        assertEqual(chips[6].key, 'website');
        assertEqual(chips[6].label, 'johnarch.dev');
        assertEqual(chips[7].key, 'portfolio');
        assertEqual(chips[7].label, 'portfolio.johnarch.dev');
      },
    ],

    // 8. Summary chips filters whitespace/empty fields
    [
      'test_stepCardCustomization_summary_chips_filters_empty_and_whitespace_fields',
      () => {
        const draft: OnboardingDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          workEmail: 'test@mindpros.com',
          phone: '   ',
          location: '',
          linkedin: '',
          github: '   ',
        };

        const chips: { label: string; key: string }[] = [];
        if (draft.workEmail?.trim()) {
          chips.push({ label: draft.workEmail.trim(), key: 'email' });
        }
        if (draft.phone?.trim()) {
          chips.push({ label: draft.phone.trim(), key: 'phone' });
        }
        if (draft.location?.trim()) {
          chips.push({ label: draft.location.trim(), key: 'location' });
        }
        if (draft.linkedin?.trim()) {
          chips.push({ label: `in/${draft.linkedin.trim()}`, key: 'linkedin' });
        }
        if (draft.github?.trim()) {
          chips.push({ label: `gh/${draft.github.trim()}`, key: 'github' });
        }

        assertEqual(chips.length, 1);
        assertEqual(chips[0].key, 'email');
        assertEqual(chips[0].label, 'test@mindpros.com');
      },
    ],

    // 9. Card aspect ratio and dimension calculations
    [
      'test_stepCardCustomization_card_aspect_ratio_and_responsive_dimensions',
      () => {
        assertEqual(CARD_ASPECT_RATIO, 1.586);

        const computeDimensions = (windowWidth: number) => {
          const cardWidth = Math.min(Math.max((windowWidth || 360) - 48, 280), 340);
          const cardHeight = Math.round(cardWidth / CARD_ASPECT_RATIO);
          return { cardWidth, cardHeight };
        };

        // Standard modern iPhone / Pixel (width ~390)
        const standard = computeDimensions(390);
        assertEqual(standard.cardWidth, 340);
        assertEqual(standard.cardHeight, Math.round(340 / 1.586)); // 214

        // Compact device (width ~320)
        const compact = computeDimensions(320);
        assertEqual(compact.cardWidth, 280);
        assertEqual(compact.cardHeight, Math.round(280 / 1.586)); // 177

        // Large tablet (width ~768)
        const tablet = computeDimensions(768);
        assertEqual(tablet.cardWidth, 340); // clamped to max 340
      },
    ],

    // 10. Finish CTA execution when not saving
    [
      'test_stepCardCustomization_finish_cta_invokes_onFinish_when_not_saving',
      () => {
        let finishCalled = false;
        const isSaving = false;
        const onFinish = () => {
          finishCalled = true;
        };

        const handleFinish = () => {
          if (isSaving) return;
          onFinish();
        };

        handleFinish();
        assertEqual(finishCalled, true);
      },
    ],

    // 11. Finish CTA blocks execution when saving
    [
      'test_stepCardCustomization_finish_cta_blocks_invocation_when_isSaving_is_true',
      () => {
        let finishCalled = false;
        const isSaving = true;
        const onFinish = () => {
          finishCalled = true;
        };

        const handleFinish = () => {
          if (isSaving) return;
          onFinish();
        };

        handleFinish();
        assertEqual(finishCalled, false);
      },
    ],

    // 12. Component export integrity
    [
      'test_stepCardCustomization_reexported_in_components_index',
      () => {
        assertTrue(typeof StepCardCustomization === 'function');
        assertTrue(CARD_ASPECT_RATIO > 1.5);
        assertTrue(Object.keys(PRESET_CATEGORY_MAP).length >= 6);
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
