import { describe, expect, it } from 'vitest';

import { INITIAL_ONBOARDING_DRAFT } from '@/pages/onboarding/types/onboardingStepper.types';
import {
  copyFactsFrom,
  focusStartersFor,
  hasEnoughCopyFacts,
  normalizeGeneratedCopy,
} from '@/pages/onboarding/Utils/profileCopyFacts';

const draft = (fields: Partial<typeof INITIAL_ONBOARDING_DRAFT>) => ({ ...INITIAL_ONBOARDING_DRAFT, ...fields });

describe('tagline and bio writer inputs', () => {
  it('sends only writer facts, trimmed, including focus', () => {
    const facts = copyFactsFrom(draft({
      firstName: ' Sam ', title: 'Data Engineer', organization: 'Northwind',
      focus: '  pipelines for hospital records ', email: 'sam@example.com', phone: '555',
    }));
    expect(facts).toEqual({
      firstName: 'Sam', lastName: '', preferredName: '', title: 'Data Engineer', organization: 'Northwind',
      department: '', accreditations: '', businessAddress: '', focus: 'pipelines for hospital records',
    });
    expect(facts).not.toHaveProperty('email');
  });

  it('copes with drafts saved before focus existed', () => {
    const legacy = { ...draft({ title: 'Engineer' }) } as Partial<typeof INITIAL_ONBOARDING_DRAFT>;
    delete legacy.focus;
    expect(copyFactsFrom(legacy as typeof INITIAL_ONBOARDING_DRAFT).focus).toBe('');
  });

  it('writes only with a focus, or a title and a company', () => {
    expect(hasEnoughCopyFacts(copyFactsFrom(draft({ firstName: 'Sam', title: 'Engineer' })))).toBe(false);
    expect(hasEnoughCopyFacts(copyFactsFrom(draft({ title: 'Engineer', organization: 'Northwind' })))).toBe(true);
    expect(hasEnoughCopyFacts(copyFactsFrom(draft({ focus: 'helping farmers sell direct' })))).toBe(true);
  });

  it('offers focus starters that match the job title', () => {
    expect(focusStartersFor('Senior Data Analyst')).toContain('Data pipelines');
    expect(focusStartersFor('Co-founder & CEO').length).toBeGreaterThan(0);
    expect(focusStartersFor('Astronaut')).toEqual([]);
  });
});

describe('writer responses', () => {
  it('reads tagline options from the current API', () => {
    expect(normalizeGeneratedCopy({ tagline: 'A', taglines: ['A', ' B ', ''], shortBio: ' Bio ' })).toEqual({
      taglines: ['A', 'B'],
      shortBio: 'Bio',
    });
  });

  it('still reads the single tagline older API versions send', () => {
    expect(normalizeGeneratedCopy({ tagline: 'Engineer at Northwind', shortBio: 'Bio' })).toEqual({
      taglines: ['Engineer at Northwind'],
      shortBio: 'Bio',
    });
  });

  it('treats an empty answer as no suggestion', () => {
    expect(normalizeGeneratedCopy({ taglines: [], shortBio: '' })).toBeNull();
    expect(normalizeGeneratedCopy(null)).toBeNull();
  });
});
