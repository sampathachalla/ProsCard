import { randomUUID } from 'node:crypto';
import { HttpError } from '../../src/errors.js';
import type { MediaKind, MediaRepository, MediaRow, MediaScope } from '../repository/media.repository.js';
import type { ObjectStorageGateway } from './oci-storage.service.js';

const profileField: Record<MediaKind, string> = {
  profilePhoto: 'photoUrl', coverPhoto: 'coverPhotoUrl', companyLogo: 'companyLogoUrl',
};
const cardField: Record<MediaKind, string> = {
  profilePhoto: 'profilePhoto', coverPhoto: 'coverPhoto', companyLogo: 'logo',
};
const fieldFor = (row: Pick<MediaRow, 'attachment_scope' | 'kind'>) =>
  row.attachment_scope === 'profile' ? profileField[row.kind] : cardField[row.kind];

type UploadInput = {
  kind: MediaKind; scope: MediaScope; cardId?: string;
  fileName: string; contentType: string; sizeBytes?: number;
};

export class MediaService {
  constructor(private readonly repo: MediaRepository, private readonly storage: ObjectStorageGateway) {}

  async requestUpload(userId: string, input: UploadInput) {
    if (input.scope === 'card' && (!input.cardId || !await this.repo.cardOwned(userId, input.cardId))) {
      throw new HttpError(404, 'Card not found.');
    }
    const target = input.scope === 'card' ? `cards/${input.cardId}` : 'profile';
    const objectName = `users/${userId}/${target}/${input.kind}/${randomUUID()}-${input.fileName}`;
    const row = await this.repo.create(
      userId, objectName, input.kind, input.contentType, input.fileName,
      input.sizeBytes, input.scope, input.cardId,
    );
    const signed = await this.storage.createUploadUrl(objectName);
    return {
      mediaId: row.id, kind: input.kind, scope: input.scope, cardId: input.cardId,
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
    const field = fieldFor(row);
    const previous = await this.repo.findAttached(userId, row.attachment_scope, field, row.card_id ?? undefined);
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
      mediaId: id, kind: row.kind, scope: row.attachment_scope, cardId: row.card_id,
      status: ready!.status, profileField: row.attachment_scope === 'profile' ? field : undefined,
      cardField: row.attachment_scope === 'card' ? field : undefined,
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
