import { z } from 'zod';
import { CONTACT_TEXT_LIMITS } from '../../shared/card-text-limits.js';

const contactFields = {
  name: z.string().trim().min(1).max(CONTACT_TEXT_LIMITS.name),
  title: z.string().trim().max(CONTACT_TEXT_LIMITS.title),
  company: z.string().trim().max(CONTACT_TEXT_LIMITS.company),
  phone: z.string().trim().max(CONTACT_TEXT_LIMITS.phone),
  secondaryPhone: z.string().trim().max(CONTACT_TEXT_LIMITS.phone),
  email: z.union([z.literal(''), z.string().email().max(CONTACT_TEXT_LIMITS.email)]),
  website: z.string().trim().max(CONTACT_TEXT_LIMITS.website),
  address: z.string().trim().max(CONTACT_TEXT_LIMITS.address),
  notes: z.string().trim().max(CONTACT_TEXT_LIMITS.notes),
  initials: z.string().trim().max(10),
  color: z.string().trim().max(50),
  sourceCardId: z.string().uuid().nullable().optional(),
  captureKind: z.enum(['business_card', 'badge', 'manual', 'qr']).optional(),
  eventName: z.string().trim().max(CONTACT_TEXT_LIMITS.eventName),
};

export const contactSchema = z.object({
  ...contactFields,
  title: contactFields.title.default(''),
  company: contactFields.company.default(''),
  phone: contactFields.phone.default(''),
  secondaryPhone: contactFields.secondaryPhone.default(''),
  email: contactFields.email.default(''),
  website: contactFields.website.default(''),
  address: contactFields.address.default(''),
  notes: contactFields.notes.default(''),
  initials: contactFields.initials.default(''),
  color: contactFields.color.default('#2563eb'),
  eventName: contactFields.eventName.default(''),
});
// Built from the fields without defaults: zod 4 applies a default even inside .optional(), so a partial
// update would otherwise blank every field it did not send.
export const contactPatchSchema = z.object(contactFields).partial().refine((value) => Object.keys(value).length > 0);
export const renameContactEventSchema = z.object({
  fromEventName: z.string().trim().min(1).max(CONTACT_TEXT_LIMITS.eventName),
  toEventName: z.string().trim().min(1).max(CONTACT_TEXT_LIMITS.eventName),
});
