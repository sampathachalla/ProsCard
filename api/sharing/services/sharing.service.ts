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

  async revoke(u:string,id:string){if(!await this.repo.revoke(u,id))throw new HttpError(404,'Share not found.')}}
