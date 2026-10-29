import { describe, expect, it } from 'vitest';
import { groupUserMediaByKind } from '@/pages/profile/Utils/userMediaLibraryUtils';
import type { UserMediaLibraryItem } from '@/services/api/types';

describe('user media library', () => {
  it('groups items by kind for section rendering', () => {
    const items: UserMediaLibraryItem[] = [
      {
        mediaId: 'a',
        kind: 'coverPhoto',
        contentUrl: '/api/v1/media/a/content',
        originalName: 'cover.png',
        createdAt: '2026-01-01T00:00:00.000Z',
        inUse: true,
      },
      {
        mediaId: 'b',
        kind: 'profilePhoto',
        contentUrl: '/api/v1/media/b/content',
        originalName: 'me.png',
        createdAt: '2026-01-02T00:00:00.000Z',
        inUse: false,
      },
      {
        mediaId: 'c',
        kind: 'companyLogo',
        contentUrl: '/api/v1/media/c/content',
        originalName: 'logo.png',
        createdAt: '2026-01-03T00:00:00.000Z',
        inUse: false,
      },
    ];
    expect(groupUserMediaByKind(items)).toEqual({
      coverPhoto: [items[0]],
      profilePhoto: [items[1]],
      companyLogo: [items[2]],
    });
  });
});
