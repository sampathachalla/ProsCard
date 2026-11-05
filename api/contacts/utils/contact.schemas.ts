import { z } from 'zod';

const contactFields = {
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200),
  company: z.string().trim().max(200),
  phone: z.string().trim().max(100),
  secondaryPhone: z.string().trim().max(100),
  email: z.union([z.literal(''), z.string().email()]),
  website: z.string().trim().max(500),
  address: z.string().trim().max(500),
  notes: z.string().trim().max(2000),
  initials: z.string().trim().max(10),
  color: z.string().trim().max(50),
  sourceCardId: z.string().uuid().nullable().optional(),
  captureKind: z.enum(['business_card', 'badge', 'manual', 'qr']).optional(),
  eventName: z.string().trim().max(200),
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
  fromEventName: z.string().trim().min(1).max(200),
  toEventName: z.string().trim().min(1).max(200),
});
