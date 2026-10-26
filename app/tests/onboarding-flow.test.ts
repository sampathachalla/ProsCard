import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/profile/Services/mediaService', () => ({
  cacheMediaFileFromUri: vi.fn(),
  requestMediaUpload: vi.fn(),
  uploadToObjectStorage: vi.fn(),
  confirmMedia: vi.fn(),
}));

vi.mock('@/pages/profile/Services/mediaCache', () => ({
  invalidateCachedMedia: vi.fn(),
}));

vi.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: vi.fn() },
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));

import {
  ONBOARDING_FLOW,
  calculateProfileCompletion,
  countProgressSteps,
  flowIndexForField,
  progressStepIndex,
} from '@/pages/onboarding/types/onboardingFlow.types';
import { INITIAL_ONBOARDING_DRAFT } from '@/pages/onboarding/types/onboardingStepper.types';
import { runValidateOnboardingFlowGroupTests } from '@/pages/onboarding/Utils/validateOnboardingFlowGroup.test';
import { runValidateOnboardingTests } from '@/pages/onboarding/Utils/validateOnboarding.test';
import { runOnboardingMappersTests } from '@/pages/onboarding/Utils/onboardingMappers.test';
import { runAdversarialTests } from '@/pages/onboarding/Utils/onboardingChallenger.test';

describe('onboarding 8-step flow & completion percentage', () => {
  it('defines welcome + 7 group steps + complete in the requested order', () => {
    expect(ONBOARDING_FLOW[0]?.kind).toBe('welcome');
    const groups = ONBOARDING_FLOW.filter((item) => item.kind === 'group');
    expect(groups.map((g) => (g.kind === 'group' ? g.groupId : null))).toEqual([
      'name_legal',
      'role_company',
      'contact_email',
      'tagline',
      'short_bio',
      'presence',
      'social_links',
    ]);
    expect(ONBOARDING_FLOW[ONBOARDING_FLOW.length - 1]?.kind).toBe('complete');
    expect(countProgressSteps()).toBe(7);
    expect(progressStepIndex(0)).toBe(-1);
    expect(progressStepIndex(1)).toBe(0);
    expect(progressStepIndex(7)).toBe(6);
    expect(progressStepIndex(8)).toBe(-1);
  });

  it('routes field errors to the exact corresponding step index', () => {
    expect(flowIndexForField('firstName')).toBe(1);
    expect(flowIndexForField('lastName')).toBe(1);
    expect(flowIndexForField('title')).toBe(2);
    expect(flowIndexForField('organization')).toBe(2);
    expect(flowIndexForField('accreditations')).toBe(2);
    expect(flowIndexForField('email')).toBe(3);
    expect(flowIndexForField('phone')).toBe(3);
    expect(flowIndexForField('businessAddress')).toBe(3);
    expect(flowIndexForField('tagline')).toBe(4);
    expect(flowIndexForField('shortBio')).toBe(5);
    expect(flowIndexForField('photoUrl')).toBe(6);
    expect(flowIndexForField('companyLogoUrl')).toBe(6);
    expect(flowIndexForField('coverPhotoUrl')).toBe(6);
    expect(flowIndexForField('website')).toBe(7);
    expect(flowIndexForField('linkedin')).toBe(7);
  });

  it('calculates dynamic profile completion percentage accurately', () => {
    expect(calculateProfileCompletion(INITIAL_ONBOARDING_DRAFT)).toBe(0);

    const coreOnly = {
      ...INITIAL_ONBOARDING_DRAFT,
      firstName: 'Sampath',
      lastName: 'Achalla',
      title: 'Software Developer',
      email: 'sampath@mindpros.com',
    };
    expect(calculateProfileCompletion(coreOnly)).toBe(40);

    const withJobAndContact = {
      ...coreOnly,
      organization: 'Mind Pros',
      accreditations: 'MS',
      phone: '+15551234567',
      businessAddress: 'Baltimore',
    };
    expect(calculateProfileCompletion(withJobAndContact)).toBe(60);

    const fullDraft = {
      ...withJobAndContact,
      tagline: 'Building tools for the future',
      shortBio: 'I am here to build tools for the future',
      photoUrl: 'https://example.com/photo.png',
      companyLogoUrl: 'https://example.com/logo.png',
      coverPhotoUrl: 'https://example.com/cover.png',
      linkedin: 'sampath',
    };
    expect(calculateProfileCompletion(fullDraft)).toBe(100);
  });

  it('passes all onboarding utility and challenger test suites', () => {
    const groupRes = runValidateOnboardingFlowGroupTests();
    expect(groupRes.failed).toBe(0);

    const valRes = runValidateOnboardingTests();
    expect(valRes.failed).toBe(0);

    const mapRes = runOnboardingMappersTests();
    expect(mapRes.failed).toBe(0);

    const advRes = runAdversarialTests();
    expect(advRes.results.filter((r) => !r.passed)).toEqual([]);
  });
});
