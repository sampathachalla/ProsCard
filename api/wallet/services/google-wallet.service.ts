import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { GoogleAuth, Impersonated } from 'google-auth-library';
import { escapeVcardValue } from '../../sharing/services/sharing.service.js';
import { backgroundHex, type WalletCard } from '../utils/wallet-card.js';

export type GoogleWalletConfig = { issuerId: string; serviceAccountPath: string; serviceAccountEmail?: string };

type ServiceAccount = { client_email: string; private_key: string; private_key_id?: string };

/**
 * Version the class and object together when the front-of-pass template changes. Google keeps
 * previously saved objects, so a new id guarantees that an existing tester sees the redesign.
 */
const PASS_VERSION = 'v5';
const CLASS_SUFFIX = `vcpros_business_card_${PASS_VERSION}`;
const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1';

export function googleWalletConfigured(config: GoogleWalletConfig): boolean {
  return Boolean(config.issuerId && (config.serviceAccountEmail || config.serviceAccountPath));
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const text = (value: string) => ({ defaultValue: { language: 'en-US', value } });

function contactQr(card: WalletCard): string {
  const fields = [['FN', card.name], ['ORG', card.company], ['TITLE', card.title], ['TEL', card.phone], ['EMAIL', card.email], ['URL', card.website]] as const;
  return ['BEGIN:VCARD', 'VERSION:3.0', `N:;${escapeVcardValue(card.name)};;;`, ...fields.filter(([, value]) => value)
    .map(([key, value]) => `${key}:${escapeVcardValue(value)}`), 'END:VCARD'].join('\r\n');
}

export type GoogleWalletImages = {
  media: (mediaId: string) => string;
  brandLogo: string;
  presetCover: (presetId: string) => string;
  /** The card's logo pre-fitted to the banner size (see WalletService.logoBanner). */
  logoBanner: string;
};

/**
 * Builds a "Save to Google Wallet" link: a JWT signed with the issuer's service account that carries the
 * generic pass. Opening the link shows Google's add-to-wallet screen; nothing is stored by us.
 */
export class GoogleWalletLinkGenerator {
  private readonly account?: ServiceAccount;
  private readonly accountEmail: string;
  private readonly auth?: GoogleAuth;

  constructor(private readonly config: GoogleWalletConfig) {
    if (config.serviceAccountEmail) {
      this.accountEmail = config.serviceAccountEmail;
      this.auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    } else {
      this.account = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8')) as ServiceAccount;
      this.accountEmail = this.account.client_email;
    }
  }

  /** Every image URL must be public HTTPS; Google downloads the images itself. */
  async createSaveUrl(card: WalletCard, shareUrl: string, images: GoogleWalletImages): Promise<string> {
    const classId = `${this.config.issuerId}.${CLASS_SUFFIX}`;
    const objectId = `${this.config.issuerId}.card_${PASS_VERSION}_${card.cardId.replace(/[^\w.-]/g, '_')}`;
    const share = new URL(shareUrl);
    const includeShare = Boolean(this.account) || (share.protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(share.hostname));
    // The round pass logo shows the card's profile photo; without one, the user's logo, then ours.
    const userLogo = card.logoMediaId ? images.media(card.logoMediaId) : card.logoUrl;
    const logoUrl = card.photoMediaId ? images.media(card.photoMediaId) : userLogo ?? images.brandLogo;

    const passObject = {
      // Only the front of the card: photo, company, name, title, QR and the user's logo. No cover image or details list.
      id: objectId,
      classId,
      state: 'ACTIVE',
      cardTitle: text(card.company || 'VC Pros'),
      header: text(card.name),
      ...(card.title ? { subheader: text(card.title) } : {}),
      ...(includeShare ? { logo: { sourceUri: { uri: logoUrl }, contentDescription: text(card.photoMediaId ? card.name : userLogo ? card.company || 'Company logo' : 'VC Pros') } } : {}),
      // The user's logo sits in the banner under the QR (Google draws the QR itself, so it cannot hold the logo).
      ...(includeShare && userLogo ? { heroImage: { sourceUri: { uri: images.logoBanner }, contentDescription: text(card.company || 'Company logo') } } : {}),
      hexBackgroundColor: backgroundHex(card), // the card's top (identity) section colour, as on the Apple pass
      barcode: { type: 'QR_CODE', value: includeShare ? shareUrl : contactQr(card), alternateText: includeShare ? 'Scan to share card' : 'Scan to save contact' },
    };

    const passClass = { id: classId };
    const claims = {
      iss: this.accountEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: [],
    };
    if (!this.account) {
      if (!this.auth) throw new Error('Google Wallet signer is unavailable.');
      const client = await this.auth.getClient();
      const wallet = new Impersonated({
        sourceClient: client,
        targetPrincipal: this.accountEmail,
        targetScopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        lifetime: 300,
      });
      await this.insertWalletResource(wallet, 'genericClass', passClass);
      if (!await this.insertWalletResource(wallet, 'genericObject', passObject)) {
        await wallet.request({ method: 'PUT', url: `${WALLET_API}/genericObject/${encodeURIComponent(objectId)}`, data: passObject, timeout: 10_000 });
      }
      const { data } = await client.request<{ signedJwt: string }>({
        method: 'POST',
        url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(this.accountEmail)}:signJwt`,
        data: { payload: JSON.stringify({ ...claims, payload: { genericObjects: [{ id: objectId }] } }) },
        timeout: 10_000,
      });
      if (!data.signedJwt) throw new Error('Google IAM returned no signed Wallet pass.');
      return `https://pay.google.com/gp/v/save/${data.signedJwt}`;
    }
    const payload = JSON.stringify({ ...claims, payload: { genericClasses: [passClass], genericObjects: [passObject] } });
    const header = { alg: 'RS256', typ: 'JWT', ...(this.account.private_key_id ? { kid: this.account.private_key_id } : {}) };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(payload)}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(this.account.private_key);
    return `https://pay.google.com/gp/v/save/${unsigned}.${base64url(signature)}`;
  }

  private async insertWalletResource(wallet: Impersonated, collection: 'genericClass' | 'genericObject', resource: { id: string }) {
    try {
      await wallet.request({ method: 'POST', url: `${WALLET_API}/${collection}`, data: resource, timeout: 10_000 });
      return true;
    } catch (error) {
      if ((error as { response?: { status?: number } } | null)?.response?.status === 409) return false;
      throw error;
    }
  }
}
