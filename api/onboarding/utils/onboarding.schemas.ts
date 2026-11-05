import { z } from 'zod';
import { CARD_TEXT_LIMITS } from '../../shared/card-text-limits.js';
export const onboardingDraftSchema = z.record(z.string(), z.unknown());

const optionalFact = (max: number) => z.string().trim().max(max).default('');

export const generateProfileCopySchema = z.object({
  firstName: optionalFact(CARD_TEXT_LIMITS.namePart),
  lastName: optionalFact(CARD_TEXT_LIMITS.namePart),
  preferredName: optionalFact(CARD_TEXT_LIMITS.professionalName),
  title: optionalFact(CARD_TEXT_LIMITS.title),
  organization: optionalFact(CARD_TEXT_LIMITS.company),
  department: optionalFact(100),
  accreditations: optionalFact(CARD_TEXT_LIMITS.accreditations),
  businessAddress: optionalFact(100),
  /** The user's own words for what they work on; the one fact that makes the copy specific. */
  focus: optionalFact(160),
}).refine(
  (input) => Boolean(input.firstName || input.lastName || input.title || input.organization || input.focus),
  { message: 'Add a name, job title, or company before generating profile copy.' },
);

const taglineText = z.string().trim().min(1).max(CARD_TEXT_LIMITS.tagline);

/** What the model returns: one tagline per style, plus the bio. */
export const modelProfileCopySchema = z.object({
  taglineWhatTheyDo: taglineText,
  taglineRoleAndCompany: taglineText,
  taglinePersonal: taglineText,
  shortBio: z.string().trim().min(1).max(CARD_TEXT_LIMITS.bio),
});

/**
 * What the API returns. `tagline` (the first option) stays for app builds that predate the options;
 * `taglines` holds the distinct options to choose from.
 */
export const generatedProfileCopySchema = z.object({
  tagline: taglineText,
  taglines: z.array(taglineText).min(1).max(3),
  shortBio: z.string().trim().min(1).max(CARD_TEXT_LIMITS.bio),
});

export type GenerateProfileCopyInput = z.infer<typeof generateProfileCopySchema>;
export type GeneratedProfileCopy = z.infer<typeof generatedProfileCopySchema>;
