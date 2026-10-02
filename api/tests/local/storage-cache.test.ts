import { describe, expect, it } from 'vitest';
import { CachedDownloadUrlStorage, type ObjectStorageGateway } from '../../media/services/oci-storage.service.js';

function fakeStorage(lifetimeMs: number) {
  let signed = 0;
  const gateway: ObjectStorageGateway = {
    createUploadUrl: async (name) => ({ url: `up/${name}`, expiresAt: new Date(Date.now() + lifetimeMs) }),
    createDownloadUrl: async (name) => ({ url: `down/${name}/${++signed}`, expiresAt: new Date(Date.now() + lifetimeMs) }),
    objectExists: async () => true,
    deleteObject: async () => {},
  };
  return { gateway, signedCount: () => signed };
}

describe('cached download URLs', () => {
  it('reuses a fresh signed URL instead of creating a new one per view', async () => {
    const inner = fakeStorage(15 * 60 * 1000);
    const storage = new CachedDownloadUrlStorage(inner.gateway);
    const first = await storage.createDownloadUrl('users/a/photo.png');
    expect(await storage.createDownloadUrl('users/a/photo.png')).toEqual(first);
    await storage.createDownloadUrl('users/a/other.png');
    expect(inner.signedCount()).toBe(2);
  });

  it('signs again when the cached URL is close to expiry or the object was deleted', async () => {
    const inner = fakeStorage(60 * 1000); // shorter than the 2-minute minimum
    const storage = new CachedDownloadUrlStorage(inner.gateway);
    await storage.createDownloadUrl('x');
    await storage.createDownloadUrl('x');
    expect(inner.signedCount()).toBe(2);

    const longLived = fakeStorage(15 * 60 * 1000);
    const cached = new CachedDownloadUrlStorage(longLived.gateway);
    await cached.createDownloadUrl('y');
    await cached.deleteObject('y');
    await cached.createDownloadUrl('y');
    expect(longLived.signedCount()).toBe(2);
  });

  it('stays within its size limit', async () => {
    const storage = new CachedDownloadUrlStorage(fakeStorage(15 * 60 * 1000).gateway, 2 * 60 * 1000, 3);
    for (const name of ['a', 'b', 'c', 'd', 'e']) await storage.createDownloadUrl(name);
    expect((storage as unknown as { cache: Map<string, unknown> }).cache.size).toBeLessThanOrEqual(3);
  });
});
