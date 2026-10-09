import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PKPass } from 'passkit-generator';
import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
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

/** Generates the landscape visual strip displaying the user's cover photo with the circular profile photo avatar composited on top. */
async function walletStrip(card: WalletCard, images: PassImages) {
  const width = 1125;
  const height = 432;
  const [gradientStart, gradientEnd] = card.colors.headerGradient;

  const base = images.cover
    ? sharp(images.cover).rotate().resize(width, height, { fit: 'cover' })
    : sharp(
        Buffer.from(
          `<svg width="${width}" height="${height}"><defs><linearGradient id="default" x2="1" y2="1"><stop stop-color="${gradientStart}"/><stop offset="1" stop-color="${gradientEnd}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#default)"/></svg>`,
        ),
      );

  const overlays: OverlayOptions[] = [];

  // If user has a cover photo, apply a subtle tint overlay for depth
  if (images.cover) {
    const [r, g, b] = rgbParts(card.colors.headerBackground);
    overlays.push({
      input: Buffer.from(
        `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="rgb(${r},${g},${b})" fill-opacity=".35"/></svg>`,
      ),
    });
  }

  // If user has a profile photo, composite a circular avatar with border onto the strip
  if (images.photo) {
    try {
      const avatarSize = 270;
      const borderWidth = 8;
      const innerSize = avatarSize - borderWidth * 2;
      const circleMask = Buffer.from(
        `<svg width="${innerSize}" height="${innerSize}"><circle cx="${innerSize / 2}" cy="${innerSize / 2}" r="${innerSize / 2}" fill="#fff"/></svg>`,
      );
      const borderRing = Buffer.from(
        `<svg width="${avatarSize}" height="${avatarSize}"><circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2 - borderWidth / 2}" fill="none" stroke="#ffffff" stroke-width="${borderWidth}"/></svg>`,
      );

      const roundedPhoto = await sharp(images.photo)
        .rotate()
        .resize(innerSize, innerSize, { fit: 'cover' })
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .png()
        .toBuffer();

      const avatar = await sharp({
        create: {
          width: avatarSize,
          height: avatarSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          { input: roundedPhoto, left: borderWidth, top: borderWidth },
          { input: borderRing, left: 0, top: 0 },
        ])
        .png()
        .toBuffer();

      overlays.push({
        input: avatar,
        left: Math.round((width - avatarSize) / 2),
        top: Math.round((height - avatarSize) / 2),
      });
    } catch {
      // In case photo processing fails, proceed with base strip
    }
  }

  if (overlays.length > 0) {
    return base.composite(overlays).png().toBuffer();
  }
  return base.png().toBuffer();
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
      // Native PassKit logo — Apple places this in the pass header
      ...(await variants(logoSource, 'logo', 160, 50, 'contain')),
      ...(await variants(strip, 'strip', 375, 144, 'cover')),
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

    // Top header (right side, opposite the logo): Company name
    if (card.company) {
      pass.headerFields.push({ key: 'header_company', label: 'COMPANY', value: card.company });
    }

    // Primary fields: Kept empty so Apple does NOT paint large text over the strip artwork,
    // keeping the user's cover photo and circular profile photo clearly visible.

    // Below strip: Preferred Name and Job Title side by side (clean 2-column layout)
    pass.secondaryFields.push({ key: 'name', label: 'PREFERRED NAME', value: card.name });
    if (card.title) {
      pass.secondaryFields.push({ key: 'title', label: 'JOB TITLE', value: card.title });
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
