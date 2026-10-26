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
}).refine(
  (input) => Boolean(input.firstName || input.lastName || input.title || input.organization),
  { message: 'Add a name, job title, or company before generating profile copy.' },
);

export const generatedProfileCopySchema = z.object({
  tagline: z.string().trim().min(1).max(120),
  shortBio: z.string().trim().min(1).max(240),
});

export type GenerateProfileCopyInput = z.infer<typeof generateProfileCopySchema>;
export type GeneratedProfileCopy = z.infer<typeof generatedProfileCopySchema>;
