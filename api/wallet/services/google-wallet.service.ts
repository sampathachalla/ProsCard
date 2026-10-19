import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { backgroundHex, type WalletCard } from '../utils/wallet-card.js';

export type GoogleWalletConfig = { issuerId: string; serviceAccountPath: string };

type ServiceAccount = { client_email: string; private_key: string; private_key_id?: string };

/**
 * Version the class and object together when the front-of-pass template changes. Google keeps
 * previously saved objects, so a new id guarantees that an existing tester sees the redesign.
 */
const PASS_VERSION = 'v2';
const CLASS_SUFFIX = `vcpros_business_card_${PASS_VERSION}`;

export function googleWalletConfigured(config: GoogleWalletConfig): boolean {
  return Boolean(config.issuerId && config.serviceAccountPath);
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const text = (value: string) => ({ defaultValue: { language: 'en-US', value } });
const templateField = (id: string) => ({
  firstValue: { fields: [{ fieldPath: `object.textModulesData['${id}']` }] },
});

export type GoogleWalletImages = {
  media: (mediaId: string) => string;
  brandLogo: string;
  presetCover: (presetId: string) => string;
};

/**
 * Builds a "Save to Google Wallet" link: a JWT signed with the issuer's service account that carries the
 * generic pass. Opening the link shows Google's add-to-wallet screen; nothing is stored by us.
 */
export class GoogleWalletLinkGenerator {
  private readonly account: ServiceAccount;

  constructor(private readonly config: GoogleWalletConfig) {
    this.account = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8')) as ServiceAccount;
  }

  /** Every image URL must be public HTTPS; Google downloads the images itself. */
  createSaveUrl(card: WalletCard, shareUrl: string, images: GoogleWalletImages): string {
    const classId = `${this.config.issuerId}.${CLASS_SUFFIX}`;
    const objectId = `${this.config.issuerId}.card_${PASS_VERSION}_${card.cardId.replace(/[^\w.-]/g, '_')}`;
    const heroUrl = card.coverMediaId
      ? images.media(card.coverMediaId)
      : card.coverPresetId
        ? images.presetCover(card.coverPresetId)
        : card.photoMediaId
          ? images.media(card.photoMediaId)
          : null;
    const details = [
      ['company', 'Company', card.company],
      ['title', 'Job title', card.title],
      ['tag', 'Card tag', card.tag],
      ['email', 'Email', card.email],
      ['phone', 'Phone', card.phone],
      ['website', 'Website', card.website],
      ['address', 'Address', card.address],
    ].filter(([, , value]) => value);

    const passObject = {
      id: objectId,
      classId,
      state: 'ACTIVE',
      cardTitle: text(card.company || 'VC Pros'),
      header: text(card.name),
      ...(card.title ? { subheader: text(card.title) } : {}),
      logo: { sourceUri: { uri: images.brandLogo }, contentDescription: text('VC Pros') },
      ...(heroUrl ? { heroImage: { sourceUri: { uri: heroUrl }, contentDescription: text(`${card.name} card cover`) } } : {}),
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
      payload: {
        genericClasses: [{
          id: classId,
          classTemplateInfo: {
            cardTemplateOverride: {
              cardRowTemplateInfos: [{
                threeItems: {
                  startItem: templateField('company'),
                  middleItem: templateField('title'),
                  endItem: templateField('tag'),
                },
              }],
            },
          },
        }],
        genericObjects: [passObject],
      },
    };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(this.account.private_key);
    return `https://pay.google.com/gp/v/save/${unsigned}.${base64url(signature)}`;
  }
}
