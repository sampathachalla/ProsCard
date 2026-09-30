import { randomUUID } from 'node:crypto';
import { HttpError } from '../../src/errors.js';
import type { MediaKind, MediaRepository, MediaRow, MediaScope } from '../repository/media.repository.js';
import type { ObjectStorageGateway } from './oci-storage.service.js';

type ProfileMediaKind = Exclude<MediaKind, 'contactCard'>;
const profileField: Record<ProfileMediaKind, string> = {
  profilePhoto: 'photoUrl', coverPhoto: 'coverPhotoUrl', companyLogo: 'companyLogoUrl',
};
const cardField: Record<ProfileMediaKind, string> = {
  profilePhoto: 'profilePhoto', coverPhoto: 'coverPhoto', companyLogo: 'logo',
};
/** Contact data field that holds the scanned business-card photo. */
export const CONTACT_CARD_FIELD = 'cardImageUrl';
const fieldFor = (row: Pick<MediaRow, 'attachment_scope' | 'kind'>) => {
  if (row.attachment_scope === 'contact' || row.kind === 'contactCard') return CONTACT_CARD_FIELD;
  const kind = row.kind as ProfileMediaKind;
  return row.attachment_scope === 'profile' ? profileField[kind] : cardField[kind];
};
const targetIdFor = (row: Pick<MediaRow, 'attachment_scope' | 'card_id' | 'contact_id'>) =>
  (row.attachment_scope === 'contact' ? row.contact_id : row.card_id) ?? undefined;

type UploadInput = {
  kind: MediaKind; scope: MediaScope; cardId?: string; contactId?: string;
  fileName: string; contentType: string; sizeBytes?: number;
};

export class MediaService {
  constructor(private readonly repo: MediaRepository, private readonly storage: ObjectStorageGateway) {}

  async requestUpload(userId: string, input: UploadInput) {
    if (input.scope === 'card' && (!input.cardId || !await this.repo.cardOwned(userId, input.cardId))) {
      throw new HttpError(404, 'Card not found.');
    }
    if (input.scope === 'contact' && (!input.contactId || !await this.repo.contactOwned(userId, input.contactId))) {
      throw new HttpError(404, 'Contact not found.');
    }
    const target = input.scope === 'card' ? `cards/${input.cardId}`
      : input.scope === 'contact' ? `contacts/${input.contactId}` : 'profile';
    const objectName = `users/${userId}/${target}/${input.kind}/${randomUUID()}-${input.fileName}`;
    const row = await this.repo.create(
      userId, objectName, input.kind, input.contentType, input.fileName,
      input.sizeBytes, input.scope, input.cardId, input.contactId,
    );
    const signed = await this.storage.createUploadUrl(objectName);
    return {
      mediaId: row.id, kind: input.kind, scope: input.scope, cardId: input.cardId, contactId: input.contactId,
      status: row.status, objectName, method: 'PUT', headers: { 'Content-Type': input.contentType }, ...signed,
    };
  }

  async confirm(userId: string, id: string) {
    const row = await this.requireRow(userId, id);
    if (!await this.storage.objectExists(row.object_name)) {
      throw new HttpError(409, 'The OCI upload has not completed.');
    }
    if (row.attachment_scope === 'card' && (!row.card_id || !await this.repo.cardOwned(userId, row.card_id))) {
      throw new HttpError(404, 'Card not found.');
    }
    if (row.attachment_scope === 'contact' && (!row.contact_id || !await this.repo.contactOwned(userId, row.contact_id))) {
      throw new HttpError(404, 'Contact not found.');
    }
    const field = fieldFor(row);
    const previous = await this.repo.findAttached(userId, row.attachment_scope, field, targetIdFor(row));
    const ready = await this.repo.ready(userId, id);
    await this.repo.attach(ready!, field);
    let replacedMediaId: string | undefined;
    let cleanupPending = false;
    if (previous && previous.id !== id) {
      replacedMediaId = previous.id;
      try {
        await this.storage.deleteObject(previous.object_name);
        await this.repo.delete(userId, previous.id);
      } catch {
        cleanupPending = true;
        await this.repo.cleanupFailed(userId, previous.id);
      }
    }
    return {
      mediaId: id, kind: row.kind, scope: row.attachment_scope, cardId: row.card_id, contactId: row.contact_id,
      status: ready!.status, profileField: row.attachment_scope === 'profile' ? field : undefined,
      cardField: row.attachment_scope === 'card' ? field : undefined,
      contactField: row.attachment_scope === 'contact' ? field : undefined,
      contentUrl: `/api/v1/media/${id}/content`, replacedMediaId, cleanupPending,
    };
  }

  private async clean(rows: MediaRow[]) {
    let cleaned = 0; let failed = 0;
    for (const row of rows) {
      try {
        await this.storage.deleteObject(row.object_name);
        await this.repo.delete(row.user_id, row.id);
        cleaned++;
      } catch {
        await this.repo.cleanupFailed(row.user_id, row.id);
        failed++;
      }
    }
    return { examined: rows.length, cleaned, failed };
  }
  retryCleanup(userId: string) { return this.repo.cleanupCandidates(userId).then((rows) => this.clean(rows)); }
  retryAllCleanup() { return this.repo.cleanupCandidatesAll().then((rows) => this.clean(rows)); }

  async cleanupCard(userId: string, cardId: string) {
    const rows = await this.repo.cardMedia(userId, cardId);
    for (const row of rows) {
      try {
        await this.storage.deleteObject(row.object_name);
        await this.repo.delete(userId, row.id);
      } catch {
        await this.repo.cleanupFailed(userId, row.id);
        await this.repo.clearCardId(userId, row.id);
      }
    }
  }

  async cleanupContact(userId: string, contactId: string) {
    const rows = await this.repo.contactMedia(userId, contactId);
    for (const row of rows) {
      try {
        await this.storage.deleteObject(row.object_name);
        await this.repo.delete(userId, row.id);
      } catch {
        await this.repo.cleanupFailed(userId, row.id);
        await this.repo.clearContactId(userId, row.id);
      }
    }
  }

  /** Deletes every stored object for an account; failures stay queued for the cleanup job. */
  async purgeUser(userId: string) {
    const rows = await this.repo.allForUser(userId);
    for (const row of rows) {
      try {
        await this.storage.deleteObject(row.object_name);
        await this.repo.delete(userId, row.id);
      } catch {
        await this.repo.cleanupFailed(userId, row.id);
      }
    }
  }

  async download(userId: string, id: string) {
    const row = await this.requireRow(userId, id);
    if (row.status !== 'ready') throw new HttpError(409, 'Media upload is not confirmed.');
    return this.storage.createDownloadUrl(row.object_name);
  }
  async delete(userId: string, id: string) {
    const row = await this.requireRow(userId, id);
    await this.storage.deleteObject(row.object_name);
    await this.repo.detach(row, fieldFor(row));
    await this.repo.delete(userId, id);
  }
  private async requireRow(userId: string, id: string) {
    const row = await this.repo.find(userId, id);
    if (!row) throw new HttpError(404, 'Media not found.');
    return row;
  }
}
