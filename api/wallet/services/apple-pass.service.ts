import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PKPass } from 'passkit-generator';
import sharp from 'sharp';
import type { WalletCard } from '../utils/wallet-card.js';

export type AppleWalletConfig = {
  passTypeId: string;
  teamId: string;
  certPath: string;
  keyPath: string;
  keyPassphrase: string;
  wwdrPath: string;
};

/** Apple's pass web service: Wallet calls it when the pass is added to or removed from a device. */
export type PassWebService = { url: string; token: string };

/** Images shown on the pass; any can be missing. */
export type PassImages = { photo?: Buffer | null; logo?: Buffer | null; cover?: Buffer | null };

const DEFAULT_ICON = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'proscard-logo.png');

export function appleWalletConfigured(config: AppleWalletConfig): boolean {
  return Boolean(config.passTypeId && config.teamId && config.certPath && config.keyPath && config.wwdrPath);
}

/** Apple's pass image sizes (points); @2x/@3x variants are generated from the same source. */
async function variants(source: Buffer, name: string, width: number, height: number, fit: 'cover' | 'contain') {
  const files: Record<string, Buffer> = {};
  for (const [suffix, scale] of [['', 1], ['@2x', 2], ['@3x', 3]] as const) {
    files[`${name}${suffix}.png`] = await sharp(source)
      .rotate()
      .resize(width * scale, height * scale, { fit, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }
  return files;
}

function rgbParts(color: string): [number, number, number] {
  const values = color.match(/\d+/g)?.map(Number);
  return values?.length === 3 ? values as [number, number, number] : [37, 99, 235];
}

/** Cover / gradient strip only — company logo uses Apple's native `logo.png` slot, not this image. */
async function walletStrip(card: WalletCard, images: PassImages) {
  const width = 1125;
  const height = 432;
  const [r, g, b] = rgbParts(card.colors.headerBackground);
  const [gradientStart, gradientEnd] = card.colors.headerGradient;
  const base = images.cover
    ? sharp(images.cover).rotate().resize(width, height, { fit: 'cover' })
    : sharp(Buffer.from(`<svg width="${width}" height="${height}"><defs><linearGradient id="default" x2="1" y2="1"><stop stop-color="${gradientStart}"/><stop offset="1" stop-color="${gradientEnd}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#default)"/></svg>`));
  if (!images.cover) {
    return base.png().toBuffer();
  }
  return base
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="rgb(${r},${g},${b})" fill-opacity=".82"/></svg>`,
        ),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Builds a signed Apple Wallet pass that mirrors the My Cards card: name with the profile photo,
 * title and company, the company logo in the header, the card colours, and the share-page QR code.
 * The card id is the serial number, so adding the pass again replaces the earlier one.
 */
export class AppleWalletPassGenerator {
  private readonly certificates;
  /** Derived from the signing key, so pass tokens stay valid across restarts without another secret. */
  private readonly tokenKey: Buffer;

  constructor(private readonly config: AppleWalletConfig) {
    this.certificates = {
      wwdr: readFileSync(config.wwdrPath),
      signerCert: readFileSync(config.certPath),
      signerKey: readFileSync(config.keyPath),
      signerKeyPassphrase: config.keyPassphrase || undefined,
    };
    this.tokenKey = createHash('sha256').update(this.certificates.signerKey).digest();
  }

  get passTypeId() {
    return this.config.passTypeId;
  }

  /** Per-pass secret Wallet sends back as `Authorization: ApplePass <token>`. */
  authToken(serialNumber: string): string {
    return createHmac('sha256', this.tokenKey).update(`pass-auth:${serialNumber}`).digest('base64url');
  }

  verifyAuth(serialNumber: string, header: string | undefined): boolean {
    const given = Buffer.from((header ?? '').replace(/^ApplePass\s+/i, ''));
    const expected = Buffer.from(this.authToken(serialNumber));
    return given.length === expected.length && timingSafeEqual(given, expected);
  }

  async create(card: WalletCard, shareUrl: string, images: PassImages, webService?: PassWebService): Promise<Buffer> {
    const strip = await walletStrip(card, images);
    const logoSource = images.logo ?? readFileSync(DEFAULT_ICON);
    const files: Record<string, Buffer> = {
      ...(await variants(readFileSync(DEFAULT_ICON), 'icon', 29, 29, 'contain')),
      // Native PassKit logo — Apple places this in the pass header (not painted onto the strip).
      ...(await variants(logoSource, 'logo', 160, 50, 'contain')),
      ...(await variants(strip, 'strip', 375, 144, 'cover')),
      ...(images.photo ? await variants(images.photo, 'thumbnail', 90, 90, 'cover') : {}),
    };

    const pass = new PKPass(files, this.certificates, {
      formatVersion: 1,
      passTypeIdentifier: this.config.passTypeId,
      teamIdentifier: this.config.teamId,
      serialNumber: card.cardId,
      organizationName: card.company || 'ProsCard',
      description: `${card.name} — business card`,
      backgroundColor: card.colors.background,
      foregroundColor: card.colors.foreground,
      labelColor: card.colors.accent,
      suppressStripShine: true,
      sharingProhibited: false,
      ...(webService ? { webServiceURL: webService.url, authenticationToken: webService.token } : {}),
    });
    pass.type = 'storeCard';

    // Top-right corner header field in Apple Wallet
    if (card.company) {
      pass.headerFields.push({ key: 'header_company', label: 'COMPANY', value: card.company });
    }

    // Logo uses Apple's header logo slot. Strip is cover/gradient only (no logo drawn on it).
    pass.primaryFields.push({ key: 'name', label: 'PREFERRED NAME', value: card.name });
    if (card.title) pass.secondaryFields.push({ key: 'title', label: 'JOB TITLE', value: card.title });
    if (card.email) {
      pass.secondaryFields.push({ key: 'email', label: 'EMAIL', value: card.email });
    } else if (card.phone) {
      pass.secondaryFields.push({ key: 'phone', label: 'PHONE', value: card.phone });
    } else if (card.company && !card.title) {
      pass.secondaryFields.push({ key: 'company', label: 'COMPANY', value: card.company });
    }

    const back = [
      ['name', 'Preferred name', card.name],
      ['title', 'Job title', card.title],
      ['company', 'Company', card.company],
      ['email', 'Email', card.email],
      ['phone', 'Phone', card.phone],
      ['website', 'Website', card.website],
      ['address', 'Address', card.address],
      ['card', 'Full card', shareUrl],
    ] as const;
    // Keys must be unique across the whole pass, front and back.
    for (const [key, label, value] of back) {
      if (value) pass.backFields.push({ key: `back_${key}`, label, value });
    }

    pass.setBarcodes({ message: shareUrl, format: 'PKBarcodeFormatQR', messageEncoding: 'iso-8859-1', altText: 'Scan to view card' });
    return pass.getAsBuffer();
  }
}
