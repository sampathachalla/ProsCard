import{randomBytes}from'node:crypto';import{HttpError}from'../../src/errors.js';import type{SharingRepository}from'../repository/sharing.repository.js';import type{ObjectStorageGateway}from'../../media/services/oci-storage.service.js';

const PROTECTED_MEDIA = /\/api\/v1\/media\/([0-9a-f-]{36})\/content/g;

/**
 * Stored media links (`/api/v1/media/:id/content`) need the owner's login. For a public share they are
 * rewritten to share-scoped links that work for anyone holding the share URL, and only while it is active.
 */
function withShareMediaLinks<T>(data: T, slug: string): T {
  return JSON.parse(JSON.stringify(data ?? {}).replace(PROTECTED_MEDIA, (_m, id: string) => `/api/v1/sharing/public/${slug}/media/${id}`)) as T;
}

export class SharingService{constructor(private readonly repo:SharingRepository,private readonly storage?:ObjectStorageGateway){}async create(u:string,c:string,e?:string|null){if(!e){const existing=await this.repo.findReusable(u,c);if(existing)return existing}const row=await this.repo.create(u,c,randomBytes(8).toString('base64url'),e?new Date(e):null);if(!row)throw new HttpError(404,'Card not found.');return row}async resolve(slug:string){const row=await this.repo.public(slug);if(!row)throw new HttpError(404,'Shared card not found or expired.');return{id:row.card_id,...row.card_data}}

  /** Everything the public share page needs to render the card exactly as the owner sees it. */
  async view(slug: string) {
    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    return {
      card: withShareMediaLinks({ ...row.card_data, id: row.card_id }, slug),
      profile: withShareMediaLinks(row.profile_data ?? {}, slug),
    };
  }

  /**
   * Signed download URL for an image on a shared card. Only images the card or the owner's profile
   * actually show are served, so a share link cannot be used to read the owner's other media.
   */
  async mediaUrl(slug: string, mediaId: string) {
    if (!this.storage) throw new HttpError(503, 'Media storage is not configured.');
    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    const shown = `/api/v1/media/${mediaId}/content`;
    const referenced = JSON.stringify(row.card_data).includes(shown) || JSON.stringify(row.profile_data ?? {}).includes(shown);
    const media = referenced ? await this.repo.readyMedia(row.user_id, mediaId) : null;
    if (!media) throw new HttpError(404, 'Image not found.');
    return this.storage.createDownloadUrl(media.object_name);
  }

  async vcard(slug: string): Promise<{ vcard: string; filename: string }> {
    const row = await this.repo.publicView(slug);
    if (!row) throw new HttpError(404, 'Shared card not found or expired.');
    const card = (row.card_data ?? {}) as Record<string, unknown>;
    const profile = (row.profile_data ?? {}) as Record<string, unknown>;
    const name = String(card.name || profile.fullName || 'Contact');
    const filename = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`;

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

  async revoke(u:string,id:string){if(!await this.repo.revoke(u,id))throw new HttpError(404,'Share not found.')}}
