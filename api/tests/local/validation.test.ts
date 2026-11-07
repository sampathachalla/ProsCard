import { describe, expect, it } from 'vitest';
import { credentialsSchema } from '../../auth/utils/auth.schemas.js';
import { cardPatchSchema } from '../../cards/utils/card.schemas.js';
import { contactPatchSchema, contactSchema } from '../../contacts/utils/contact.schemas.js';
import { mediaRequestSchema } from '../../media/utils/media.schemas.js';
import { startMediaCleanupJob } from '../../jobs/mediaCleanupJob.js';
import type { MediaService } from '../../media/services/media.service.js';

describe('local request validation', () => {
  it('normalizes valid authentication credentials', () => {
    expect(credentialsSchema.parse({ email: ' user@example.com ', password: 'password123' }).email).toBe('user@example.com');
  });
  it('rejects short passwords', () => {
    expect(() => credentialsSchema.parse({ email: 'user@example.com', password: 'short' })).toThrow();
  });
  it('requires at least one card patch property', () => {
    expect(() => cardPatchSchema.parse({})).toThrow();
  });
  it('rejects card copy that exceeds the layout-safe limits', () => {
    expect(() => cardPatchSchema.parse({ title: 'T'.repeat(33) })).toThrow();
    expect(() => cardPatchSchema.parse({ company: 'C'.repeat(33) })).toThrow();
    expect(() => cardPatchSchema.parse({ sectionOverrides: { tagline: 'T'.repeat(49) } })).toThrow();
    expect(() => cardPatchSchema.parse({ sectionOverrides: { bio: 'B'.repeat(181) } })).toThrow();
    expect(() => cardPatchSchema.parse({ sectionOverrides: { prefix: 'P'.repeat(13) } })).toThrow();
    expect(() => cardPatchSchema.parse({ sectionOverrides: { suffix: 'S'.repeat(13) } })).toThrow();
    expect(() => cardPatchSchema.parse({ sectionOverrides: { cardTag: 'T'.repeat(25) } })).toThrow();
    expect(() =>
      cardPatchSchema.parse({
        sectionOverrides: {
          firstName: 'Alexander',
          lastName: 'Montgomery-Whitehead-Smithsonian',
        },
      }),
    ).toThrow();
    expect(() =>
      cardPatchSchema.parse({
        connectionFields: [{ id: 'link', type: 'url', value: 'https://example.com/' + 'a'.repeat(2048) }],
      }),
    ).toThrow();
    expect(cardPatchSchema.parse({ sectionOverrides: { tagline: 'T'.repeat(48) } })).toEqual({
      sectionOverrides: { tagline: 'T'.repeat(48) },
    });
  });
  it('applies contact defaults', () => {
    const contact = contactSchema.parse({ name: 'Ada Lovelace' });
    expect(contact.company).toBe('');
    expect(contact.color).toBe('#2563eb');
  });
  it('rejects contact text that exceeds the safe display limits', () => {
    expect(() => contactSchema.parse({ name: 'N'.repeat(49) })).toThrow();
    expect(() => contactSchema.parse({ name: 'Ada', title: 'T'.repeat(33) })).toThrow();
    expect(() => contactSchema.parse({ name: 'Ada', company: 'C'.repeat(33) })).toThrow();
    expect(contactSchema.parse({ name: 'N'.repeat(48) }).name).toHaveLength(48);
  });
  it('sanitizes media names and enforces the size limit', () => {
    const media = mediaRequestSchema.parse({ kind: 'profilePhoto', fileName: '../avatar.png', contentType: 'image/png', sizeBytes: 1024 });
    expect(media.fileName).toBe('avatar.png');
    expect(() => mediaRequestSchema.parse({ kind: 'profilePhoto', fileName: 'large.png', contentType: 'image/png', sizeBytes: 21 * 1024 * 1024 })).toThrow();
  });
  it('requires contact card media to target a contact', () => {
    const contactId = '6f1c2a0e-5d8b-4c1e-9a3f-2b7d4e6c8a10';
    expect(mediaRequestSchema.parse({ kind: 'contactCard', scope: 'contact', contactId, fileName: 'card.jpg', contentType: 'image/jpeg' }).contactId).toBe(contactId);
    expect(() => mediaRequestSchema.parse({ kind: 'contactCard', scope: 'contact', fileName: 'card.jpg', contentType: 'image/jpeg' })).toThrow();
    expect(() => mediaRequestSchema.parse({ kind: 'contactCard', fileName: 'card.jpg', contentType: 'image/jpeg' })).toThrow();
    expect(() => mediaRequestSchema.parse({ kind: 'profilePhoto', scope: 'contact', contactId, fileName: 'card.jpg', contentType: 'image/jpeg' })).toThrow();
    expect(() => mediaRequestSchema.parse({ kind: 'profilePhoto', contactId, fileName: 'card.jpg', contentType: 'image/jpeg' })).toThrow();
  });
  it('starts and stops the automatic cleanup job',async()=>{let calls=0;const service={retryAllCleanup:async()=>{calls++;return{examined:0,cleaned:0,failed:0}}} as MediaService;const job=startMediaCleanupJob(service,3600);await new Promise(resolve=>setTimeout(resolve,0));job.stop();expect(calls).toBe(1);});
});

describe('partial updates only carry the fields that were sent', () => {
  it('does not add blank card details the client never sent', () => {
    const patch = cardPatchSchema.parse({ appliedTheme: null, sectionOverrides: { logoBackdrop: '#ffffff' } });
    expect(Object.keys(patch).sort()).toEqual(['appliedTheme', 'sectionOverrides']);
  });

  it('does not add blank contact details the client never sent', () => {
    expect(contactPatchSchema.parse({ name: 'Ada Lovelace' })).toEqual({ name: 'Ada Lovelace' });
  });

  it('still lets a client clear a field on purpose', () => {
    expect(cardPatchSchema.parse({ title: '' })).toEqual({ title: '' });
    expect(contactPatchSchema.parse({ eventName: '' })).toEqual({ eventName: '' });
  });

  it('still fills defaults when a card or contact is created', () => {
    expect(contactSchema.parse({ name: 'Ada Lovelace' }).company).toBe('');
    expect(contactSchema.parse({ name: 'Ada Lovelace' }).color).toBe('#2563eb');
  });
});
