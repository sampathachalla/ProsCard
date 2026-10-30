import type { OnboardingDraft } from '../types/onboardingStepper.types';

/** The facts the tagline and bio writer may use; nothing else from the draft is sent. */
export function copyFactsFrom(draft: OnboardingDraft) {
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    preferredName: draft.preferredName.trim(),
    title: draft.title.trim(),
    organization: draft.organization.trim(),
    department: draft.department.trim(),
    accreditations: draft.accreditations.trim(),
    businessAddress: draft.businessAddress.trim(),
    focus: (draft.focus ?? '').trim(),
  };
}

export type ProfileCopyFacts = ReturnType<typeof copyFactsFrom>;

/**
 * Enough to write something about this person rather than filler: their own focus, or at least a job
 * title and a company. A name and title alone only produce generic lines.
 */
export function hasEnoughCopyFacts(facts: ProfileCopyFacts) {
  return Boolean(facts.focus || (facts.title && facts.organization));
}

/** Tap-to-add starters for "What do you focus on?", matched to the job title. */
const FOCUS_STARTERS: { match: RegExp; starters: string[] }[] = [
  { match: /data|analyt|scien/i, starters: ['Data pipelines', 'Dashboards for', 'Forecasting'] },
  { match: /engineer|developer|programmer|software|devops|architect/i, starters: ['Mobile apps', 'Backend systems', 'Developer tools'] },
  { match: /design|ux|ui|creative/i, starters: ['Product design', 'Brand identity', 'Design systems'] },
  { match: /sales|account|business development|bd/i, starters: ['Enterprise sales', 'Partnerships', 'Growing accounts in'] },
  { match: /market|growth|brand|content|social/i, starters: ['Growth marketing', 'Content strategy', 'Brand campaigns'] },
  { match: /founder|ceo|owner|co-founder|entrepreneur/i, starters: ['Building a company that', 'Helping customers', 'Fundraising for'] },
  { match: /product|pm\b/i, starters: ['Product strategy', 'Shipping features for', 'Customer research'] },
  { match: /recruit|talent|hr|people/i, starters: ['Hiring engineers', 'Talent strategy', 'Employee experience'] },
  { match: /consult|advis|strategy/i, starters: ['Advising companies on', 'Operations strategy', 'Digital transformation'] },
  { match: /doctor|nurse|clinic|health|medic|physician/i, starters: ['Patient care in', 'Clinical research', 'Healthcare operations'] },
  { match: /finance|account|cfo|invest|bank/i, starters: ['Financial planning', 'Investing in', 'Fundraising'] },
  { match: /teach|professor|educat|lectur/i, starters: ['Teaching', 'Research on', 'Curriculum design'] },
];

export function focusStartersFor(title: string): string[] {
  return FOCUS_STARTERS.find((entry) => entry.match.test(title))?.starters ?? [];
}

export interface GeneratedProfileCopy {
  /** Tagline options to choose from, best first (empty when only a bio came back). */
  taglines: string[];
  shortBio: string;
}

/** Accepts the current response (`taglines`) and the single `tagline` older API versions send. */
export function normalizeGeneratedCopy(
  raw: { tagline?: unknown; taglines?: unknown; shortBio?: unknown } | null,
): GeneratedProfileCopy | null {
  if (!raw) return null;
  const options = Array.isArray(raw.taglines) ? raw.taglines : [raw.tagline];
  const taglines = options
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
  const shortBio = typeof raw.shortBio === 'string' ? raw.shortBio.trim() : '';
  if (!taglines.length && !shortBio) return null;
  return { taglines, shortBio };
}
