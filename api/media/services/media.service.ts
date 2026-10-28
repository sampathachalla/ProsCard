import { createHash, randomUUID } from 'node:crypto';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import type { MediaKind, MediaRepository, MediaRow, MediaScope } from '../repository/media.repository.js';
import type { ObjectStorageGateway } from './oci-storage.service.js';
import { extractPaletteFromBuffer, type ExtractedLogoPalette } from './palette-extractor.service.js';
import { brandfetchService } from './brandfetch.service.js';

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

const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024;
const LOGO_FETCH_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

export class MediaService {
  constructor(private readonly repo: MediaRepository, private readonly storage: ObjectStorageGateway) {}

  private async paletteForBuffer(buffer: Buffer, sourceKey?: string): Promise<ExtractedLogoPalette> {
    const contentHash = createHash('sha256').update(buffer).digest('hex');
    const cached = await this.repo.findLogoThemeByContentHash(contentHash);
    if (cached) return sourceKey
      ? this.repo.saveLogoTheme(contentHash, cached, sourceKey)
      : cached;
    const palette = await extractPaletteFromBuffer(buffer);
    return this.repo.saveLogoTheme(contentHash, palette, sourceKey);
  }

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
    let signed: Awaited<ReturnType<ObjectStorageGateway['createUploadUrl']>>;
    try {
      signed = await this.storage.createUploadUrl(objectName);
    } catch (error) {
      try {
        await this.repo.delete(userId, row.id);
      } catch (cleanupError) {
        log('warn', 'media_upload_ticket_cleanup_failed', {
          mediaId: row.id,
          message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }
      throw error;
    }
    return {
      mediaId: row.id, kind: input.kind, scope: input.scope, cardId: input.cardId, contactId: input.contactId,
      status: row.status, objectName, method: 'PUT', headers: { 'Content-Type': input.contentType }, ...signed,
    };
  }

  async confirm(userId: string, id: string) {
    const row = await this.requireRow(userId, id);
    const uploaded = await this.storage.objectMetadata(row.object_name);
    if (!uploaded) {
      throw new HttpError(409, 'The OCI upload has not completed.');
    }
    // React Native / some PAR PUTs store application/octet-stream (or omit Content-Type).
    // Trust the ticket's declared image type when OCI metadata is missing or generic.
    const declaredType = String(row.content_type ?? '').split(';', 1)[0]!.trim().toLowerCase();
    const storedType = String(uploaded.contentType ?? '').split(';', 1)[0]!.trim().toLowerCase();
    const effectiveType =
      storedType.startsWith('image/')
        ? storedType
        : declaredType.startsWith('image/')
          ? declaredType
          : storedType;
    if (
      !Number.isSafeInteger(uploaded.sizeBytes)
      || uploaded.sizeBytes <= 0
      || uploaded.sizeBytes > MAX_MEDIA_SIZE_BYTES
      || !effectiveType.startsWith('image/')
    ) {
      await this.rejectInvalidUpload(row);
      throw new HttpError(422, 'The uploaded image type or size is not allowed.');
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
    if (!ready) throw new HttpError(409, 'Media could not be confirmed.');
    try {
      const attached = await this.repo.attach(ready, field);
      if (!attached) {
        throw new HttpError(409, 'The card, contact, or profile for this upload no longer exists.');
      }
    } catch (error) {
      try {
        await this.repo.cleanupFailed(userId, id);
      } catch (cleanupError) {
        log('warn', 'media_confirm_cleanup_mark_failed', {
          mediaId: id,
          message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }
      throw error;
    }
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
    let palette: ExtractedLogoPalette | undefined;
    if (ready.kind === 'companyLogo') {
      try {
        const signed = await this.storage.createDownloadUrl(ready.object_name);
        const res = await fetch(signed.url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          palette = await this.paletteForBuffer(buffer);
        }
      } catch (paletteErr) {
        log('warn', 'palette_extraction_failed', {
          mediaId: id,
          message: paletteErr instanceof Error ? paletteErr.message : String(paletteErr),
        });
      }
    }
    return {
      mediaId: id, kind: row.kind, scope: row.attachment_scope, cardId: row.card_id, contactId: row.contact_id,
      status: ready.status, profileField: row.attachment_scope === 'profile' ? field : undefined,
      cardField: row.attachment_scope === 'card' ? field : undefined,
      contactField: row.attachment_scope === 'contact' ? field : undefined,
      contentUrl: `/api/v1/media/${id}/content`, replacedMediaId, cleanupPending,
      palette,
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
        // Marking can fail too (database blip); keep going so one row doesn't abandon the batch.
        await this.repo.cleanupFailed(row.user_id, row.id).catch((error) => {
          log('warn', 'media_cleanup_mark_failed', {
            mediaId: row.id,
            message: error instanceof Error ? error.message : String(error),
          });
        });
        failed++;
      }
    }
    return { examined: rows.length, cleaned, failed };
  }

  private async rejectInvalidUpload(row: MediaRow) {
    try {
      await this.storage.deleteObject(row.object_name);
      await this.repo.delete(row.user_id, row.id);
    } catch (error) {
      await this.repo.cleanupFailed(row.user_id, row.id).catch((cleanupError) => {
        log('warn', 'invalid_media_cleanup_mark_failed', {
          mediaId: row.id,
          message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      });
      log('warn', 'invalid_media_cleanup_failed', {
        mediaId: row.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
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
    const row = this.repo.findForDownload
      ? await this.repo.findForDownload(userId, id)
      : await this.repo.find(userId, id);
    if (!row) throw new HttpError(404, 'Media not found.');
    if (row.status !== 'ready') throw new HttpError(409, 'Media upload is not confirmed.');
    return this.storage.createDownloadUrl(row.object_name);
  }

  async listCompanyLogos(userId: string, query?: string) {
    const cleanQuery = (query ?? '').trim();

    const communityRowsPromise = this.repo.listCommunityCompanyLogos
      ? this.repo.listCommunityCompanyLogos(userId, cleanQuery)
      : Promise.resolve([]);

    const brandfetchPromise = cleanQuery.length >= 2
      ? brandfetchService.searchBrands(cleanQuery).catch(() => [])
      : cleanQuery.length === 0
        ? brandfetchService.popularBrands().catch(() => [])
        : Promise.resolve([]);

    const [communityRows, brandfetchItems] = await Promise.all([
      communityRowsPromise,
      brandfetchPromise,
    ]);

    const items: Array<{
      mediaId: string;
      name: string;
      domain?: string;
      contentUrl: string;
      isOwn?: boolean;
      source: 'brandfetch' | 'community';
      createdAt?: string;
    }> = [];

    // Official Brandfetch logos first when searching
    for (const bf of brandfetchItems) {
      items.push({
        mediaId: `bf-${bf.brandId || bf.domain}`,
        name: bf.name,
        domain: bf.domain,
        contentUrl: bf.icon,
        isOwn: false,
        source: 'brandfetch',
      });
    }

    // Community uploads
    for (const row of communityRows) {
      const fallbackLabel = String(row.original_name || 'Company Logo')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/^companyLogo-\d+$/i, 'Uploaded Logo')
        .replace(/[-_]+/g, ' ')
        .trim();
      items.push({
        mediaId: row.id,
        name: row.company_name?.trim() || fallbackLabel || 'Company Logo',
        contentUrl: `/api/v1/media/${row.id}/content`,
        isOwn: row.user_id === userId,
        source: 'community',
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      });
    }

    return { items };
  }
  async delete(userId: string, id: string) {
    const row = await this.requireRow(userId, id);
    try {
      await this.storage.deleteObject(row.object_name);
      await this.repo.detach(row, fieldFor(row));
      await this.repo.delete(userId, id);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      try {
        await this.repo.cleanupFailed(userId, id);
      } catch (cleanupError) {
        log('warn', 'media_delete_cleanup_mark_failed', {
          mediaId: id,
          message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }
      log('error', 'media_delete_failed', {
        mediaId: id,
        message: error instanceof Error ? error.message : String(error),
      });
      throw new HttpError(502, 'Media could not be deleted. It will be retried shortly.');
    }
  }
  private async requireRow(userId: string, id: string) {
    const row = await this.repo.find(userId, id);
    if (!row) throw new HttpError(404, 'Media not found.');
    return row;
  }

  async extractPalette(userId: string, input: { mediaId?: string; imageUrl?: string }) {
    let buffer: Buffer | null = null;
    let sourceKey: string | undefined;
    let targetMediaId = input.mediaId;
    if (!targetMediaId && input.imageUrl) {
      const match = input.imageUrl.match(/\/api\/v1\/media\/([^/]+)\/content/);
      if (match?.[1]) {
        targetMediaId = match[1];
      } else if (/^[0-9a-fA-F-]{36}$/.test(input.imageUrl.trim())) {
        targetMediaId = input.imageUrl.trim();
      }
    }
    if (targetMediaId) {
      const row = await this.repo.findForDownload(userId, targetMediaId);
      if (!row) throw new HttpError(404, 'Media not found.');
      const signed = await this.storage.createDownloadUrl(row.object_name);
      const res = await fetch(signed.url);
      if (!res.ok) throw new HttpError(502, 'Could not retrieve media file.');
      buffer = Buffer.from(await res.arrayBuffer());
    } else if (input.imageUrl) {
      if (input.imageUrl.startsWith('data:image/')) {
        const base64Data = input.imageUrl.split(',')[1];
        if (base64Data) buffer = Buffer.from(base64Data, 'base64');
      } else if (input.imageUrl.startsWith('https://')) {
        sourceKey = `url:${createHash('sha256').update(input.imageUrl.trim()).digest('hex')}`;
        const cached = await this.repo.findLogoThemeBySourceKey(sourceKey);
        if (cached) return cached;
        // Brandfetch's CDN serves its HTML website to non-browser agents; ask explicitly for an image.
        const res = await fetch(input.imageUrl, {
          headers: { 'User-Agent': LOGO_FETCH_USER_AGENT, Accept: 'image/webp,image/png,image/svg+xml,image/*' },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
          buffer = Buffer.from(await res.arrayBuffer());
        }
      }
    }
    if (!buffer) {
      throw new HttpError(400, 'Could not load image data for palette extraction.');
    }
    return this.paletteForBuffer(buffer, sourceKey);
  }
}
