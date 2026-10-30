import { z } from 'zod';
export const onboardingDraftSchema = z.record(z.string(), z.unknown());

const optionalFact = (max: number) => z.string().trim().max(max).default('');

export const generateProfileCopySchema = z.object({
  firstName: optionalFact(50),
  lastName: optionalFact(50),
  preferredName: optionalFact(50),
  title: optionalFact(80),
  organization: optionalFact(100),
  department: optionalFact(100),
  accreditations: optionalFact(80),
  businessAddress: optionalFact(100),
  /** The user's own words for what they work on; the one fact that makes the copy specific. */
  focus: optionalFact(160),
}).refine(
  (input) => Boolean(input.firstName || input.lastName || input.title || input.organization || input.focus),
  { message: 'Add a name, job title, or company before generating profile copy.' },
);

const taglineText = z.string().trim().min(1).max(120);

/** What the model returns: one tagline per style, plus the bio. */
export const modelProfileCopySchema = z.object({
  taglineWhatTheyDo: taglineText,
  taglineRoleAndCompany: taglineText,
  taglinePersonal: taglineText,
  shortBio: z.string().trim().min(1).max(240),
});

/**
 * What the API returns. `tagline` (the first option) stays for app builds that predate the options;
 * `taglines` holds the distinct options to choose from.
 */
export const generatedProfileCopySchema = z.object({
  tagline: taglineText,
  taglines: z.array(taglineText).min(1).max(3),
  shortBio: z.string().trim().min(1).max(240),
});

export type GenerateProfileCopyInput = z.infer<typeof generateProfileCopySchema>;
export type GeneratedProfileCopy = z.infer<typeof generatedProfileCopySchema>;
