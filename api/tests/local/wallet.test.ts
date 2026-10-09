import { createVerify, generateKeyPairSync } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { AppleWalletPassGenerator } from '../../wallet/services/apple-pass.service.js';
import { GoogleWalletLinkGenerator } from '../../wallet/services/google-wallet.service.js';
import { toWalletCard } from '../../wallet/utils/wallet-card.js';

const forge = createRequire(import.meta.url)('node-forge');
const dir = mkdtempSync(path.join(tmpdir(), 'wallet-test-'));
const MEDIA = '11111111-2222-4333-8444-555555555555';

const card = {
  name: 'Card Name',
  title: 'Card Title',
  sectionOverrides: { title: 'Override Title', profilePhoto: `/api/v1/media/${MEDIA}/content` },
  sectionThemes: {
    professional: { surfaceColor: '#ffffff', textColor: '#0f172a', mutedTextColor: '#64748b', accentColor: '#d19000', gradient: ['#2563eb', '#00a8e8'] },
    identity: { backgroundColor: '#eff6ff', gradient: ['#111827', '#020617'] },
    connections: { accentColor: '#d19000' },
  },
};
const profile = { preferredName: 'Ada Lovelace', organization: 'Engines Ltd', email: 'ada@engines.io', phone: '+44 20 1234', website: 'engines.io', companyLogoUrl: '', coverPhotoUrl: `/api/v1/media/${MEDIA}/content` };

/** Throwaway self-signed signer, enough to exercise the real pass builder and signer. */
function selfSigned() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 86_400_000);
  const attrs = [{ name: 'commonName', value: 'Test Pass Signer' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const certPath = path.join(dir, 'cert.pem');
  const keyPath = path.join(dir, 'key.pem');
  writeFileSync(certPath, forge.pki.certificateToPem(cert));
  writeFileSync(keyPath, forge.pki.privateKeyToPem(keys.privateKey));
  return { certPath, keyPath };
}

describe('wallet passes', () => {
  it('resolves pass details like the app card: override, then profile, then card', () => {
    const wallet = toWalletCard('card-1', card, profile);
    expect(wallet.name).toBe('Ada Lovelace');
    expect(wallet.title).toBe('Override Title');
    expect(wallet.company).toBe('Engines Ltd');
    expect(wallet.photoMediaId).toBe(MEDIA);
    expect(wallet.logoMediaId).toBeNull();
    expect(wallet.coverMediaId).toBe(MEDIA);
    expect(wallet.colors.background).toBe('rgb(37, 99, 235)');
    expect(wallet.colors.foreground).toBe('rgb(248, 250, 252)');
    expect(wallet.colors.accent).toBe('rgb(248, 250, 252)');
    expect(wallet.colors.headerBackground).toBe('rgb(239, 246, 255)');
    expect(wallet.colors.headerGradient).toEqual(['#111827', '#020617']);
    expect(toWalletCard('c', { name: 'Only Card' }, null).name).toBe('Only Card');
  });

  it('builds a signed Apple pass with the card details, photo and share QR', async () => {
    const { certPath, keyPath } = selfSigned();
    const generator = new AppleWalletPassGenerator({
      passTypeId: 'pass.com.mindpros.proscard', teamId: 'TEAM123456', certPath, keyPath, keyPassphrase: '', wwdrPath: certPath,
    });
    const photo = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#336699' } }).png().toBuffer();
    const buffer = await generator.create(toWalletCard('card-1', card, profile), 'https://example.test/share/abc', { photo, cover: photo });
    const zip = buffer.toString('latin1');
    for (const file of ['pass.json', 'manifest.json', 'signature', 'icon.png', 'strip@2x.png']) expect(zip).toContain(file);
    expect(zip).toContain('"serialNumber":"card-1"');
    expect(zip).toContain('"passTypeIdentifier":"pass.com.mindpros.proscard"');
    expect(zip).toContain('Ada Lovelace');
    expect(zip).toContain('https://example.test/share/abc');
    expect(zip).toContain('PKBarcodeFormatQR');
    expect(zip).toContain('"storeCard"');
    // Web service token: stable for a serial, different per serial, and checked from the Authorization header.
    const token = generator.authToken('card-1');
    expect(generator.authToken('card-1')).toBe(token);
    expect(generator.authToken('card-2')).not.toBe(token);
    expect(generator.verifyAuth('card-1', `ApplePass ${token}`)).toBe(true);
    expect(generator.verifyAuth('card-1', 'ApplePass nope')).toBe(false);
    const withService = await generator.create(toWalletCard('card-1', card, profile), 'https://example.test/share/abc', {}, { url: 'https://example.test/api/v1/wallet/apple/ws', token });
    expect(withService.toString('latin1')).toContain('"webServiceURL":"https://example.test/api/v1/wallet/apple/ws"');
  });

  it('creates a signed "Save to Google Wallet" link carrying the generic pass', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const accountPath = path.join(dir, 'service-account.json');
    writeFileSync(accountPath, JSON.stringify({ client_email: 'wallet@test.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }), private_key_id: 'kid-1' }));
    const url = new GoogleWalletLinkGenerator({ issuerId: '3388000000012345', serviceAccountPath: accountPath })
      .createSaveUrl(toWalletCard('card-1', card, profile), 'https://example.test/share/abc', (id) => `https://example.test/img/${id}`);
    expect(url.startsWith('https://pay.google.com/gp/v/save/')).toBe(true);
    const [header, claims, signature] = url.split('/').pop()!.split('.');
    expect(createVerify('RSA-SHA256').update(`${header}.${claims}`).verify(publicKey, Buffer.from(signature!, 'base64url'))).toBe(true);
    const body = JSON.parse(Buffer.from(claims!, 'base64url').toString());
    expect(body.aud).toBe('google');
    expect(body.typ).toBe('savetowallet');
    const object = body.payload.genericObjects[0];
    expect(object.id).toBe('3388000000012345.card_card-1');
    expect(object.header.defaultValue.value).toBe('Ada Lovelace');
    expect(object.barcode.value).toBe('https://example.test/share/abc');
    expect(object.logo.sourceUri.uri).toBe(`https://example.test/img/${MEDIA}`);
    expect(object.heroImage.sourceUri.uri).toBe(`https://example.test/img/${MEDIA}`);
    expect(object.hexBackgroundColor).toBe('#2563eb');
  });
});
