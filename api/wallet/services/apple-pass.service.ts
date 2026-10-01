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

/** Images shown on the pass; any can be missing. */
export type PassImages = { photo?: Buffer | null; logo?: Buffer | null };

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

/**
 * Builds a signed Apple Wallet pass that mirrors the My Cards card: name with the profile photo,
 * title and company, the company logo in the header, the card colours, and the share-page QR code.
 * The card id is the serial number, so adding the pass again replaces the earlier one.
 */
export class AppleWalletPassGenerator {
  private readonly certificates;

  constructor(private readonly config: AppleWalletConfig) {
    this.certificates = {
      wwdr: readFileSync(config.wwdrPath),
      signerCert: readFileSync(config.certPath),
      signerKey: readFileSync(config.keyPath),
      signerKeyPassphrase: config.keyPassphrase || undefined,
    };
  }

  async create(card: WalletCard, shareUrl: string, images: PassImages): Promise<Buffer> {
    const files: Record<string, Buffer> = {
      ...(await variants(readFileSync(DEFAULT_ICON), 'icon', 29, 29, 'contain')),
      ...(images.logo ? await variants(images.logo, 'logo', 160, 50, 'contain') : {}),
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
      labelColor: card.colors.label,
      ...(images.logo ? {} : { logoText: card.company || 'ProsCard' }),
      sharingProhibited: false,
    });
    pass.type = 'generic';

    pass.primaryFields.push({ key: 'name', label: 'NAME', value: card.name });
    if (card.title) pass.secondaryFields.push({ key: 'title', label: 'TITLE', value: card.title });
    if (card.company) pass.secondaryFields.push({ key: 'company', label: 'COMPANY', value: card.company });
    if (card.phone) pass.auxiliaryFields.push({ key: 'phone', label: 'PHONE', value: card.phone });
    if (card.email) pass.auxiliaryFields.push({ key: 'email', label: 'EMAIL', value: card.email });

    const back = [
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
