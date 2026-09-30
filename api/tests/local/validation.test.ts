import { describe, expect, it } from 'vitest';
import { credentialsSchema } from '../../auth/utils/auth.schemas.js';
import { cardPatchSchema } from '../../cards/utils/card.schemas.js';
import { contactSchema } from '../../contacts/utils/contact.schemas.js';
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
  it('applies contact defaults', () => {
    const contact = contactSchema.parse({ name: 'Ada Lovelace' });
    expect(contact.company).toBe('');
    expect(contact.color).toBe('#2563eb');
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
