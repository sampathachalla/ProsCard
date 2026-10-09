import { randomBytes } from 'node:crypto';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import type { ObjectStorageGateway } from '../../media/services/oci-storage.service.js';
import type { SharingRepository } from '../repository/sharing.repository.js';

const PROTECTED_MEDIA = /\/api\/v1\/media\/([0-9a-f-]{36})\/content/g;
const SLUG_CREATE_ATTEMPTS = 5;

function collectMediaIds(...values: unknown[]): string[] {
  const ids = new Set<string>();
  for (const value of values) {
    const json = JSON.stringify(value ?? {});
    for (const match of json.matchAll(PROTECTED_MEDIA)) {
      ids.add(match[1]!);
    }
  }
  return [...ids];
}

/**
 * Prefer short-lived OCI download URLs so the phone loads images in one hop.
 * Fall back to the share media redirect when signing is unavailable for an id.
 */
function withResolvedMediaLinks<T>(data: T, urlById: Map<string, string>, slug: string): T {
  try {
    return JSON.parse(
      JSON.stringify(data ?? {}).replace(PROTECTED_MEDIA, (_m, id: string) => (
        urlById.get(id) ?? `/api/v1/sharing/public/${slug}/media/${id}`
      )),
    ) as T;
  } catch (error) {
    log('error', 'share_media_rewrite_failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError(500, 'Shared card data could not be prepared.');
  }
}

function isUniqueViolation(error: unknown) {
  return (error as { code?: string } | null)?.code === '23505';
}

export class SharingService {
  constructor(private readonly repo: SharingRepository, private readonly storage?: ObjectStorageGateway) {}

  async create(u: string, c: string, e?: string | null) {
    if (e) {
      const expires = new Date(e);
      if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
        throw new HttpError(400, 'Share expiry must be a future date and time.');
      }
    }
    if (!e) {
      const existing = await this.repo.findReusable(u, c);
      if (existing) return existing;
    }
    let lastError: unknown;
    for (let attempt = 0; attempt < SLUG_CREATE_ATTEMPTS; attempt++) {
      try {
        const row = await this.repo.create(u, c, randomBytes(8).toString('base64url'), e ? new Date(e) : null);
        if (!row) throw new HttpError(404, 'Card not found.');
        return row;
      } catch (error) {
        if (error instanceof HttpError) throw error;
        if (isUniqueViolation(error)) {
          // Concurrent reusable-share create: return the winner. Slug collisions just retry.
          if (!e) {
            const existing = await this.repo.findReusable(u, c);
            if (existing) return existing;
          }
          lastError = error;
          continue;
        }
        throw error;
      }
    }
    log('error', 'share_create_conflict', {
      message: lastError instanceof Error ? lastError.message : String(lastError),
    });
    throw new HttpError(503, 'Could not create a share link. Please try again.');
  }

  async resolve(slug: string) {
    const row = await this.repo.public(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    return { id: row.card_id, ...row.card_data };
  }

  /**
   * Everything the public share page needs. Image fields are rewritten to short-lived OCI
   * download URLs so the scanner's phone fetches photos in one hop (no API redirect per image).
   */
  async view(slug: string) {
    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    const card = { ...row.card_data, id: row.card_id };
    const profile = row.profile_data ?? {};
    const urlById = await this.signReferencedMedia(row.user_id, collectMediaIds(card, profile));
    return {
      card: withResolvedMediaLinks(card, urlById, slug),
      profile: withResolvedMediaLinks(profile, urlById, slug),
    };
  }

  /** Sign every referenced ready media object in parallel (uses the download-URL cache). */
  private async signReferencedMedia(userId: string, mediaIds: string[]) {
    const urlById = new Map<string, string>();
    if (!this.storage || !mediaIds.length) return urlById;

    const rows = await this.repo.readyMediaMany(userId, mediaIds);
    await Promise.all(rows.map(async (row) => {
      try {
        const signed = await this.storage!.createDownloadUrl(row.object_name);
        urlById.set(row.id, signed.url);
      } catch (error) {
        log('warn', 'share_media_sign_failed', {
          mediaId: row.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }));
    return urlById;
  }

  /**
   * Fallback redirect for clients that still hit the share media path (or when signing
   * failed for an individual image in /view).
   */
  async mediaUrl(slug: string, mediaId: string) {
    if (!this.storage) throw new HttpError(503, 'Media storage is not configured.');
    if (!/^[0-9a-f-]{36}$/i.test(mediaId)) throw new HttpError(404, 'Image not found.');

    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');

    const referenced = collectMediaIds(row.card_data, row.profile_data).includes(mediaId);
    if (!referenced) throw new HttpError(404, 'Image not found.');

    const media = await this.repo.readyMedia(row.user_id, mediaId);
    if (!media) throw new HttpError(404, 'Image not found.');
    return this.storage.createDownloadUrl(media.object_name);
  }

  async vcard(slug: string): Promise<{ vcard: string; filename: string }> {
    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    const card = (row.card_data ?? {}) as Record<string, unknown>;
    const profile = (row.profile_data ?? {}) as Record<string, unknown>;
    const name = String(card.name || profile.fullName || 'Contact');
    const filename = `${name.replace(/[^a-zA-Z0-9_-]+/g, '_')}.vcf`;

    const parts: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
    parts.push(`FN:${name}`);
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      parts.push(`N:${nameParts.slice(1).join(' ')};${nameParts[0]};;;`);
    } else {
      parts.push(`N:${name};;;;`);
    }
    const org = String(card.company || profile.organization || '');
    if (org) parts.push(`ORG:${org}`);
    const title = String(card.title || profile.title || '');
    if (title) parts.push(`TITLE:${title}`);
    const email = String(card.email || profile.email || '');
    if (email) parts.push(`EMAIL;TYPE=INTERNET,WORK:${email}`);
    const phone = String(card.phone || profile.phone || '');
    if (phone) parts.push(`TEL;TYPE=CELL,VOICE:${phone}`);
    const website = String(profile.website || '');
    if (website) parts.push(`URL:${website}`);
    const address = String(profile.businessAddress || '');
    if (address) parts.push(`ADR;TYPE=WORK:;;${address};;;;`);

    const noteLines: string[] = [];
    if (profile.tagline) noteLines.push(String(profile.tagline));
    if (profile.shortBio) noteLines.push(String(profile.shortBio));

    if (profile.social && typeof profile.social === 'object') {
      for (const [k, v] of Object.entries(profile.social as Record<string, unknown>)) {
        if (typeof v === 'string' && v.trim()) {
          parts.push(`X-SOCIALPROFILE;type=${k}:${v.trim()}`);
          noteLines.push(`${k}: ${v.trim()}`);
        }
      }
    }

    if (Array.isArray(card.connectionFields)) {
      for (const f of card.connectionFields) {
        if (f && typeof f === 'object' && 'value' in f && typeof f.value === 'string' && f.value.trim()) {
          const label = ('title' in f && typeof f.title === 'string' && f.title) || ('type' in f && typeof f.type === 'string' && f.type) || 'Link';
          noteLines.push(`${label}: ${f.value.trim()}`);
        }
      }
    }

    if (noteLines.length > 0) {
      parts.push(`NOTE:${noteLines.join('\\n')}`);
    }

    parts.push('END:VCARD');
    return { vcard: parts.join('\r\n'), filename };
  }

  async revoke(u: string, id: string) {
    if (!await this.repo.revoke(u, id)) throw new HttpError(404, 'Share not found.');
  }
}
