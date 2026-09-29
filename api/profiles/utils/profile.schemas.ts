import { z } from 'zod';

const optionalText = z.string().trim().max(500).default('');
export const profileSchema = z.object({
  prefix: optionalText, firstName: optionalText, middleName: optionalText,
  lastName: optionalText, suffix: optionalText, preferredName: optionalText,
  accreditations: optionalText, fullName: optionalText, title: optionalText,
  department: optionalText, organization: optionalText,
  companyLogoUrl: optionalText, coverPhotoUrl: optionalText,
  email: z.union([z.literal(''), z.string().email()]).default(''),
  phone: optionalText, photoUrl: optionalText, website: optionalText,
  social: z.record(z.string(), z.string().max(2048)).default({}),
  tagline: optionalText, businessAddress: optionalText,
  shortBio: z.string().max(5000).default(''),
});
