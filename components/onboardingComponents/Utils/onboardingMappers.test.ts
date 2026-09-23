// components/onboardingComponents/Utils/onboardingMappers.test.ts
import {
  mapDraftToProfile,
  mapDraftToBusinessCard,
  mapProfileToDraft,
} from './onboardingMappers';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { INITIAL_ONBOARDING_DRAFT } from '../types/onboardingStepper.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';

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

export function runOnboardingMappersTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const testCases: [string, () => void][] = [
    [
      'test_mapDraftToProfile_maps_and_normalizes_properly',
      () => {
        const draft: OnboardingDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          fullName: '  Jane Doe  ',
          title: '  Senior Director  ',
          phone: '  +1234567890  ',
          location: '  New York, NY  ',
          organization: '  Acme Corp  ',
          workEmail: '  jane@acme.com  ',
          shortBio: '  Building great software  ',
          linkedin: 'janedoe',
          github: 'janedoe',
          x: '@janedoe',
          website: 'acme.com',
          portfolio: 'janedoe.me',
          cardGradient: ['#2563eb', '#00a8e8'],
          cardCategory: 'Professional',
        };

        const profile: Profile = mapDraftToProfile(draft);
        assertEqual(profile.fullName, 'Jane Doe');
        assertEqual(profile.title, 'Senior Director');
        assertEqual(profile.organization, 'Acme Corp');
        assertEqual(profile.email, 'jane@acme.com');
        assertEqual(profile.phone, '+1234567890');
        assertEqual(profile.businessAddress, 'New York, NY');
        assertEqual(profile.shortBio, 'Building great software');
        assertEqual(profile.website, 'https://acme.com');
        assertEqual(profile.social.linkedin, 'https://linkedin.com/in/janedoe');
        assertEqual(profile.social.github, 'https://github.com/janedoe');
        assertEqual(profile.social.x, 'https://x.com/janedoe');
        assertEqual(profile.social.portfolio, 'https://janedoe.me');
      },
    ],
    [
      'test_mapDraftToBusinessCard_correctly_maps_aliased_properties',
      () => {
        const draft: OnboardingDraft = {
          ...INITIAL_ONBOARDING_DRAFT,
          fullName: 'Alice Smith',
          title: 'CTO',
          phone: '+1 555 987 6543',
          location: 'Austin, TX',
          organization: 'Tech Innovations',
          workEmail: 'alice@tech.io',
          shortBio: 'Tech leader',
          linkedin: '',
          github: '',
          x: '',
          website: '',
          portfolio: '',
          cardGradient: ['#111827', '#020617'],
          cardCategory: 'Business',
        };

        const card: BusinessCard = mapDraftToBusinessCard(draft);
        assertEqual(card.id, '1');
        assertEqual(card.name, 'Alice Smith');
        assertEqual(card.title, 'CTO');
        assertEqual(card.company, 'Tech Innovations');
        assertEqual(card.email, 'alice@tech.io');
        assertEqual(card.phone, '+1 555 987 6543');
        assertEqual(card.category, 'Business');
        assertDeepEqual(card.gradient, ['#111827', '#020617']);
      },
    ],
    [
      'test_mapProfileToDraft_populates_draft_values_cleanly',
      () => {
        const profile: Partial<Profile> = {
          fullName: 'Bob Builder',
          title: 'Architect',
          email: 'bob@build.com',
          phone: '+15551234',
          businessAddress: 'Seattle, WA',
          organization: 'Build Co',
          shortBio: 'Designing structures',
          website: 'https://build.com',
          social: {
            linkedin: 'https://linkedin.com/in/bob',
            x: 'https://x.com/bob',
            instagram: '',
            github: 'https://github.com/bob',
            portfolio: 'https://bob.dev',
            facebook: '',
            whatsapp: '',
            youtube: '',
            tiktok: '',
          },
        };

        const draft = mapProfileToDraft(profile);
        assertEqual(draft.fullName, 'Bob Builder');
        assertEqual(draft.title, 'Architect');
        assertEqual(draft.workEmail, 'bob@build.com');
        assertEqual(draft.phone, '+15551234');
        assertEqual(draft.location, 'Seattle, WA');
        assertEqual(draft.organization, 'Build Co');
        assertEqual(draft.shortBio, 'Designing structures');
        assertEqual(draft.linkedin, 'https://linkedin.com/in/bob');
        assertEqual(draft.github, 'https://github.com/bob');
      },
    ],
    [
      'test_mapProfileToDraft_preserves_empty_title_and_organization',
      () => {
        const profile: Partial<Profile> = {
          fullName: 'Jane Doe',
          title: '',
          organization: '',
          email: 'jane@example.com',
        };
        const card: Partial<BusinessCard> = {
          title: 'Professional',
          company: 'Independent',
        };

        const draft = mapProfileToDraft(profile, card);
        assertEqual(draft.title, '');
        assertEqual(draft.organization, '');
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
