import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { backgroundHex, type WalletCard } from '../utils/wallet-card.js';

export type GoogleWalletConfig = { issuerId: string; serviceAccountPath: string };

type ServiceAccount = { client_email: string; private_key: string; private_key_id?: string };

/** Pass class every ProsCard business card belongs to; created on first save through the JWT. */
const CLASS_SUFFIX = 'proscard_business_card';

export function googleWalletConfigured(config: GoogleWalletConfig): boolean {
  return Boolean(config.issuerId && config.serviceAccountPath);
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const text = (value: string) => ({ defaultValue: { language: 'en-US', value } });

/**
 * Builds a "Save to Google Wallet" link: a JWT signed with the issuer's service account that carries the
 * generic pass. Opening the link shows Google's add-to-wallet screen; nothing is stored by us.
 */
export class GoogleWalletLinkGenerator {
  private readonly account: ServiceAccount;

  constructor(private readonly config: GoogleWalletConfig) {
    this.account = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8')) as ServiceAccount;
  }

  /** `imageUrl(mediaId)` must return a public HTTPS URL; Google downloads the images itself. */
  createSaveUrl(card: WalletCard, shareUrl: string, imageUrl: (mediaId: string) => string): string {
    const classId = `${this.config.issuerId}.${CLASS_SUFFIX}`;
    // Same object id for the same card, so saving again updates the existing pass.
    const objectId = `${this.config.issuerId}.card_${card.cardId.replace(/[^\w.-]/g, '_')}`;
    const avatar = card.photoMediaId ?? card.logoMediaId;
    const details = [
      ['email', 'Email', card.email],
      ['phone', 'Phone', card.phone],
      ['website', 'Website', card.website],
      ['address', 'Address', card.address],
    ].filter(([, , value]) => value);

    const passObject = {
      id: objectId,
      classId,
      state: 'ACTIVE',
      cardTitle: text(card.company || 'ProsCard'),
      header: text(card.name),
      ...(card.title ? { subheader: text(card.title) } : {}),
      ...(avatar ? { logo: { sourceUri: { uri: imageUrl(avatar) }, contentDescription: text(card.name) } } : {}),
      ...(card.logoMediaId && card.photoMediaId
        ? { heroImage: { sourceUri: { uri: imageUrl(card.logoMediaId) }, contentDescription: text(card.company || 'Logo') } }
        : {}),
      hexBackgroundColor: backgroundHex(card),
      barcode: { type: 'QR_CODE', value: shareUrl, alternateText: 'Scan to view card' },
      textModulesData: details.map(([id, header, body]) => ({ id, header, body })),
      linksModuleData: { uris: [{ id: 'card', uri: shareUrl, description: 'View full card' }] },
    };

    const header = { alg: 'RS256', typ: 'JWT', ...(this.account.private_key_id ? { kid: this.account.private_key_id } : {}) };
    const claims = {
      iss: this.account.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: [],
      payload: { genericClasses: [{ id: classId }], genericObjects: [passObject] },
    };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(this.account.private_key);
    return `https://pay.google.com/gp/v/save/${unsigned}.${base64url(signature)}`;
  }
}
