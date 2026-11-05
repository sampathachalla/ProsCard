import { describe, expect, it } from 'vitest';
import { resolveCardDetails } from '../../cards/utils/card-details.js';
import type { SharingRepository } from '../../sharing/repository/sharing.repository.js';
import { SharingService } from '../../sharing/services/sharing.service.js';
import { toWalletCard } from '../../wallet/utils/wallet-card.js';

/** A card as the partial-update bug left it: stored fields blank, its real details elsewhere on the card. */
const blanked = {
  name: 'Ada Lovelace',
  title: '', company: '', phone: '', email: '',
  sectionOverrides: { preferredName: 'Ada L.', title: 'Chief Engineer', company: 'Analytical Co' },
  connectionFieldsCustomized: true,
  connectionFields: [
    { id: 'address', title: 'Address', type: 'text', value: 'London' },
    { id: 'email', title: 'Email', type: 'email', value: 'ada@analytical.co' },
    { id: 'phone', title: 'Phone', type: 'phone', value: '+44 20 1111' },
    { id: 'workphone-1', title: 'Work phone', type: 'phone', value: '+44 20 2222' },
    { id: 'website-1', title: 'Website', type: 'url', value: 'https://analytical.co' },
  ],
};
const profile = {
  preferredName: 'Account Name', title: 'Account Title', organization: 'Account Org', email: 'account@test.io',
  phone: '+1 555', website: 'https://account.test', businessAddress: 'Account Street',
};

function sharing(card: Record<string, unknown>, owner: Record<string, unknown> | null = profile) {
  const row = { card_id: 'card-1', card_data: card, profile_data: owner };
  return new SharingService({ publicView: async () => row } as unknown as SharingRepository);
}

describe('card details for wallet passes, vCards and QR scans', () => {
  it('restores a blanked card from its own overrides and contact rows', () => {
    expect(resolveCardDetails(blanked, profile)).toEqual({
      name: 'Ada L.', contactName: 'Ada L.', title: 'Chief Engineer', company: 'Analytical Co',
      emails: ['ada@analytical.co'], phones: ['+44 20 1111', '+44 20 2222'],
      website: 'https://analytical.co', address: 'London',
    });
  });

  it('falls back to the account for a card with no details of its own', () => {
    const onboardingCard = { name: 'Ada', title: '', company: '', phone: '', email: '', sectionOverrides: {} };
    expect(resolveCardDetails(onboardingCard, profile)).toEqual({
      name: 'Account Name', contactName: 'Ada', title: 'Account Title', company: 'Account Org',
      emails: ['account@test.io'], phones: ['+1 555'], website: 'https://account.test', address: 'Account Street',
    });
  });

  it('keeps the whole name for saved contacts when the card face shows a short one', async () => {
    const card = { name: 'Ada Lovelace', sectionOverrides: {} };
    const owner = { ...profile, preferredName: 'Ada' };
    expect(resolveCardDetails(card, owner)).toMatchObject({ name: 'Ada', contactName: 'Ada Lovelace' });
    const { vcard } = await sharing(card, owner).vcard('slug');
    expect(vcard).toContain('FN:Ada Lovelace');
    expect(vcard).toContain('N:Lovelace;Ada;;;');
  });

  it('prefers the card’s own fields over the account', () => {
    const details = resolveCardDetails({ title: 'Card Title', email: 'card@test.io', sectionOverrides: {} }, profile);
    expect(details.title).toBe('Card Title');
    expect(details.emails).toEqual(['card@test.io']);
  });

  it('keeps a contact row the owner removed off the card', () => {
    const details = resolveCardDetails({ ...blanked, connectionFields: blanked.connectionFields.slice(1, 2) }, profile);
    expect(details).toMatchObject({ phones: [], website: '', address: '' });
  });

  it('does not use the placeholder card name while the account has a real one', () => {
    expect(resolveCardDetails({ name: 'My VC Pros', sectionOverrides: { preferredName: 'My VC Pros' } }, profile).name).toBe('Account Name');
    expect(resolveCardDetails({ name: 'My VC Pros' }, null).name).toBe('');
  });

  it('survives malformed stored data', () => {
    const details = resolveCardDetails({ connectionFieldsCustomized: true, connectionFields: [null, 'x', { value: 5 }] }, null);
    expect(details).toMatchObject({ name: '', emails: [], phones: [] });
  });

  it('fills the wallet pass from the card, not the account', () => {
    expect(toWalletCard('card-1', blanked, profile)).toMatchObject({
      name: 'Ada L.', title: 'Chief Engineer', company: 'Analytical Co', email: 'ada@analytical.co',
      phone: '+44 20 1111', website: 'https://analytical.co', address: 'London',
    });
  });

  it('shows the account image on a pass when the card’s own is blank, like the card does', () => {
    const media = '/api/v1/media/11111111-2222-4333-8444-555555555555/content';
    const wallet = toWalletCard('card-1', { sectionOverrides: { profilePhoto: '' } }, { photoUrl: media });
    expect(wallet.photoMediaId).toBe('11111111-2222-4333-8444-555555555555');
  });

  it('fills the vCard from the card, with both phone numbers', async () => {
    const { vcard } = await sharing(blanked).vcard('slug');
    expect(vcard).toContain('FN:Ada L.');
    expect(vcard).toContain('ORG:Analytical Co');
    expect(vcard).toContain('TITLE:Chief Engineer');
    expect(vcard).toContain('EMAIL;TYPE=INTERNET,WORK:ada@analytical.co');
    expect(vcard).toContain('TEL;TYPE=CELL,VOICE:+44 20 1111');
    expect(vcard).toContain('TEL;TYPE=WORK,VOICE:+44 20 2222');
    expect(vcard).toContain('URL:https://analytical.co');
    expect(vcard).toContain('ADR;TYPE=WORK:;;London;;;;');
  });

  it('gives a QR scan the details the card shows', async () => {
    await expect(sharing(blanked).resolve('slug')).resolves.toMatchObject({
      id: 'card-1', name: 'Ada L.', title: 'Chief Engineer', company: 'Analytical Co',
      phone: '+44 20 1111', email: 'ada@analytical.co',
    });
  });
});
