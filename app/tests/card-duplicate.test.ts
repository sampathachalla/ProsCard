import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => { process.env.EXPO_PUBLIC_AUTH_TEST_MODE = 'true'; });

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));
vi.mock('expo-image-manipulator', () => ({ ImageManipulator: {}, SaveFormat: {} }));
vi.mock('@/pages/profile/Services/mediaService', () => ({
  extractLogoPalette: vi.fn(async () => { throw new Error('no palette in tests'); }),
  prefetchMedia: vi.fn(),
}));
vi.mock('@/pages/profile/Services/pendingMedia', () => ({
  commitPendingMedia: vi.fn(async (uri: string) => uri),
  isPendingMediaUrl: () => false,
}));

import { duplicateCard, getCards } from '@/pages/cards/Services/cardsService';

describe('duplicating a card', () => {
  beforeAll(() => {
    const card = getCards()[1];
    card.displayName = 'Personal';
    card.sectionOverrides = { ...card.sectionOverrides, cardTag: 'Personal', displayName: 'Personal', displayNameCustomized: 'false' };
  });

  it('keeps the person’s name, which also goes on the share page and vCard', async () => {
    const source = getCards()[1];
    const copy = await duplicateCard(source);
    expect(copy.name).toBe(source.name);
    expect(copy.id).not.toBe(source.id);
    expect(copy.isPrimary).toBe(false);
  });

  it('gives a copy with an automatic name the next one for its tag', async () => {
    const copy = await duplicateCard(getCards()[1]);
    expect(copy.displayName).toMatch(/^Personal \d+$/);
    expect(copy.displayNameCustomized).toBe(false);
  });

  it('numbers a name the user typed, without reusing one', async () => {
    const source = getCards()[2];
    source.displayName = 'Conference card';
    source.displayNameCustomized = true;
    source.sectionOverrides = { ...source.sectionOverrides, displayName: 'Conference card', displayNameCustomized: 'true' };

    const first = await duplicateCard(source);
    const second = await duplicateCard(source);
    expect(first.displayName).toBe('Conference card (2)');
    expect(second.displayName).toBe('Conference card (3)');
  });
});
