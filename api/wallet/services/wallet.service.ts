import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import type { ObjectStorageGateway } from '../../media/services/oci-storage.service.js';
import type { SharingService } from '../../sharing/services/sharing.service.js';
import type { WalletRepository } from '../repository/wallet.repository.js';
import { toWalletCard, type WalletCard } from '../utils/wallet-card.js';
import type { AppleWalletPassGenerator, PassImages } from './apple-pass.service.js';
import type { GoogleWalletLinkGenerator } from './google-wallet.service.js';

/** Apple pass links are opened in Safari, which cannot send the app's login token, so they carry a signed token. */
const APPLE_LINK_TTL_SECONDS = 300;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

type WalletDeps = {
  repo: WalletRepository;
  sharing: SharingService;
  storage: ObjectStorageGateway;
  apple?: AppleWalletPassGenerator;
  google?: GoogleWalletLinkGenerator;
  linkSecret?: string;
  /** Public address of the share page; when empty the caller's request address is used. */
  publicBaseUrl?: string;
};

export class WalletService {
  private readonly secret: Buffer;

  constructor(private readonly deps: WalletDeps) {
    this.secret = deps.linkSecret ? Buffer.from(deps.linkSecret) : randomBytes(32);
  }

  status() {
    return { apple: Boolean(this.deps.apple), google: Boolean(this.deps.google) };
  }

  baseUrl(requestBase: string) {
    return (this.deps.publicBaseUrl || requestBase).replace(/\/$/, '');
  }

  /** Short-lived link that downloads the Apple pass for one of the user's cards. */
  async appleLink(userId: string, cardId: string, base: string) {
    if (!this.deps.apple) throw new HttpError(503, 'Apple Wallet is not set up on the server yet.');
    await this.load(userId, cardId);
    const payload = Buffer.from(JSON.stringify({ u: userId, c: cardId, e: Math.floor(Date.now() / 1000) + APPLE_LINK_TTL_SECONDS })).toString('base64url');
    return { url: `${base}/api/v1/wallet/apple/${payload}.${this.sign(payload)}.pkpass` };
  }

  /** Builds the signed .pkpass for a link created by `appleLink`. */
  async applePass(token: string, base: string) {
    if (!this.deps.apple) throw new HttpError(503, 'Apple Wallet is not set up on the server yet.');
    const [payload, signature] = token.replace(/\.pkpass$/, '').split('.');
    if (!payload || !signature || !this.verify(payload, signature)) throw new HttpError(404, 'Wallet link not found.');
    const { u: userId, c: cardId, e: expires } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { u: string; c: string; e: number };
    if (expires < Date.now() / 1000) throw new HttpError(410, 'This wallet link has expired. Tap Add to Wallet again.');

    return this.buildApplePass(userId, cardId, base);
  }

  private async buildApplePass(userId: string, cardId: string, base: string) {
    const apple = this.deps.apple!;
    const { card, slug, userId: owner } = await this.load(userId, cardId);
    const images: PassImages = {
      photo: card.photoMediaId ? await this.image(owner, card.photoMediaId) : null,
      logo: card.logoMediaId ? await this.image(owner, card.logoMediaId) : null,
    };
    // Apple only calls an HTTPS web service, so local http runs simply skip the "added" confirmation.
    const webService = base.startsWith('https://')
      ? { url: `${base}/api/v1/wallet/apple/ws`, token: apple.authToken(cardId) }
      : undefined;
    const buffer = await apple.create(card, `${base}/share/${slug}`, images, webService);
    return { buffer, fileName: `${card.name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'card'}.pkpass` };
  }

  // ---- Apple pass web service (called by Wallet on the user's iPhone) ----

  private requireApplePass(passTypeId: string, serial: string, authorization: string | undefined) {
    const apple = this.deps.apple;
    if (!apple || passTypeId !== apple.passTypeId || !apple.verifyAuth(serial, authorization)) {
      throw new HttpError(401, 'Unauthorized pass.');
    }
  }

  /** Wallet added the pass on a device; returns true when that device is new for this pass. */
  async registerDevice(deviceId: string, passTypeId: string, serial: string, authorization: string | undefined, pushToken: unknown) {
    this.requireApplePass(passTypeId, serial, authorization);
    if (typeof pushToken !== 'string' || !pushToken) throw new HttpError(400, 'pushToken is required.');
    const created = await this.deps.repo.register(deviceId, passTypeId, serial, pushToken);
    log('info', 'wallet_pass_added', { cardId: serial, newDevice: created });
    return created;
  }

  async unregisterDevice(deviceId: string, passTypeId: string, serial: string, authorization: string | undefined) {
    this.requireApplePass(passTypeId, serial, authorization);
    await this.deps.repo.unregister(deviceId, passTypeId, serial);
    log('info', 'wallet_pass_removed', { cardId: serial });
  }

  /** Latest version of a pass, requested by Wallet with the pass's own token. */
  async latestApplePass(passTypeId: string, serial: string, authorization: string | undefined, base: string) {
    this.requireApplePass(passTypeId, serial, authorization);
    const owner = await this.deps.repo.cardOwner(serial);
    if (!owner) throw new HttpError(404, 'Pass not found.');
    return this.buildApplePass(owner, serial, base);
  }

  /** Whether the user's card is currently in an Apple Wallet, for the app's "added" confirmation. */
  async cardStatus(userId: string, cardId: string) {
    if (!await this.deps.repo.cardWithProfile(userId, cardId)) throw new HttpError(404, 'Card not found.');
    if (!this.deps.apple) return { apple: { enabled: false, inWallet: false, addedAt: null } };
    const { devices, addedAt } = await this.deps.repo.registrations(this.deps.apple.passTypeId, cardId);
    return { apple: { enabled: true, inWallet: devices > 0, addedAt: addedAt?.toISOString() ?? null } };
  }

  /** "Save to Google Wallet" link for one of the user's cards. */
  async googleLink(userId: string, cardId: string, base: string) {
    if (!this.deps.google) throw new HttpError(503, 'Google Wallet is not set up on the server yet.');
    const { card, slug } = await this.load(userId, cardId);
    // Google fetches pass images itself, so they go through the public, share-scoped image route.
    const url = this.deps.google.createSaveUrl(card, `${base}/share/${slug}`, (mediaId) => `${base}/api/v1/sharing/public/${slug}/media/${mediaId}`);
    return { url };
  }

  private async load(userId: string, cardId: string): Promise<{ card: WalletCard; slug: string; userId: string }> {
    const row = await this.deps.repo.cardWithProfile(userId, cardId);
    if (!row) throw new HttpError(404, 'Card not found.');
    // The pass QR opens the public share page; reuse the card's active share link or create one.
    const share = await this.deps.sharing.create(userId, cardId);
    return { card: toWalletCard(cardId, row.card_data, row.profile_data), slug: share.slug, userId };
  }

  /** Downloads a stored image for the pass; a missing or failed image just leaves it off the pass. */
  private async image(userId: string, mediaId: string): Promise<Buffer | null> {
    try {
      const objectName = await this.deps.repo.readyMediaObject(userId, mediaId);
      if (!objectName) return null;
      const { url } = await this.deps.storage.createDownloadUrl(objectName);
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) return null;
      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer.length <= MAX_IMAGE_BYTES ? buffer : null;
    } catch (error) {
      log('warn', 'wallet_image_failed', { mediaId, message: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  private sign(payload: string) {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  private verify(payload: string, signature: string) {
    const expected = Buffer.from(this.sign(payload));
    const actual = Buffer.from(signature);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
