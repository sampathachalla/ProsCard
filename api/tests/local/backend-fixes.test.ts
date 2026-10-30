import { describe, expect, it } from 'vitest';
import type { MediaRepository, MediaRow } from '../../media/repository/media.repository.js';
import { MediaService } from '../../media/services/media.service.js';
import type { ObjectStorageGateway } from '../../media/services/oci-storage.service.js';
import { isPublicAddress } from '../../media/utils/public-image-fetch.js';
import { escapeVcardValue } from '../../sharing/services/sharing.service.js';
import { WalletRepository } from '../../wallet/repository/wallet.repository.js';

const row = (id: string, kind: MediaRow['kind'], extra: Partial<MediaRow> = {}): MediaRow => ({
  id, user_id: 'user-1', object_name: `obj-${id}`, kind, status: 'ready', content_type: 'image/png',
  original_name: 'x.png', size_bytes: 1, created_at: new Date(), attachment_scope: 'card',
  card_id: 'card-1', contact_id: null, ...extra,
});

/** Media service over in-memory fakes; `sharedLogos` are ids some other card or profile still shows. */
function mediaHarness(rows: MediaRow[], sharedLogos: string[]) {
  const deletedObjects: string[] = [];
  const deletedRows: string[] = [];
  const clearedCardIds: string[] = [];
  const logoChecks: { id: string; exclude: unknown }[] = [];
  const repo = {
    cardMedia: async () => rows,
    allForUser: async () => rows,
    find: async (_u: string, id: string) => rows.find((r) => r.id === id) ?? null,
    logoInUse: async (id: string, exclude: unknown) => { logoChecks.push({ id, exclude }); return sharedLogos.includes(id); },
    delete: async (_u: string, id: string) => { deletedRows.push(id); return null; },
    clearCardId: async (_u: string, id: string) => { clearedCardIds.push(id); },
    cleanupFailed: async () => undefined,
    detach: async () => undefined,
  } as unknown as MediaRepository;
  const storage = {
    deleteObject: async (name: string) => { deletedObjects.push(name); },
  } as unknown as ObjectStorageGateway;
  return { service: new MediaService(repo, storage), deletedObjects, deletedRows, clearedCardIds, logoChecks };
}

describe('community logos other cards still show', () => {
  it('keeps the file when the uploader deletes their card', async () => {
    const h = mediaHarness([row('logo', 'companyLogo'), row('cover', 'coverPhoto')], ['logo']);
    await h.service.cleanupCard('user-1', 'card-1');
    expect(h.deletedObjects).toEqual(['obj-cover']);
    expect(h.clearedCardIds).toEqual(['logo']);
    expect(h.logoChecks).toEqual([{ id: 'logo', exclude: { cardId: 'card-1' } }]);
  });

  it('keeps the file when the uploader deletes the logo itself', async () => {
    const h = mediaHarness([row('logo', 'companyLogo')], ['logo']);
    await h.service.delete('user-1', 'logo');
    expect(h.deletedObjects).toEqual([]);
    expect(h.deletedRows).toEqual([]);
  });

  it('still deletes a logo nobody else uses', async () => {
    const h = mediaHarness([row('logo', 'companyLogo')], []);
    await h.service.delete('user-1', 'logo');
    expect(h.deletedObjects).toEqual(['obj-logo']);
  });

  it('returns shared logos from an account purge so their rows survive', async () => {
    const h = mediaHarness([row('logo', 'companyLogo'), row('photo', 'profilePhoto')], ['logo']);
    expect(await h.service.purgeUser('user-1')).toEqual(['logo']);
    expect(h.deletedObjects).toEqual(['obj-photo']);
    expect(h.logoChecks).toEqual([{ id: 'logo', exclude: { userId: 'user-1' } }]);
  });
});

describe('vCard escaping', () => {
  it('escapes separators and line breaks inside a value', () => {
    expect(escapeVcardValue('1 Main St, Suite 2; NY')).toBe('1 Main St\\, Suite 2\\; NY');
    expect(escapeVcardValue('Jane\nEMAIL:evil@example.com')).toBe('Jane\\nEMAIL:evil@example.com');
    expect(escapeVcardValue('a\\b')).toBe('a\\\\b');
  });
});

describe('public image fetch address check', () => {
  it('rejects internal and metadata addresses', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '172.20.0.1', '192.168.1.1', '169.254.169.254', '::1', 'fd00::1', '::ffff:10.0.0.1']) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });

  it('allows public addresses', () => {
    for (const address of ['8.8.8.8', '151.101.1.1', '2606:4700::1111']) {
      expect(isPublicAddress(address), address).toBe(true);
    }
  });
});

describe('wallet card owner lookup', () => {
  it('skips the query for a serial that is not a uuid', async () => {
    let queried = false;
    const repo = new WalletRepository({ query: async () => { queried = true; return { rows: [], rowCount: 0 }; } });
    expect(await repo.cardOwner('not-a-uuid')).toBeNull();
    expect(queried).toBe(false);
  });
});
