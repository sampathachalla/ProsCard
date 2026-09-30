import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/cardsComponents/Wallet', () => ({}));
vi.mock('@/components/uiComponents/Text', () => ({}));
vi.mock('lucide-react-native', () => ({}));
vi.mock('react-native', () => ({}));
vi.mock('react-native-reanimated', () => ({}));

import { stackRankFor } from '@/components/homepageComponents/Components/StackedCardView';

const ranks = (active: number, cards: number) =>
  Array.from({ length: cards + 1 }, (_, index) => stackRankFor(index, active, cards));

describe('wallet stack order', () => {
  it('gives every slot a distinct position for each active card', () => {
    for (const cards of [0, 1, 2, 5]) {
      for (let active = 0; active <= cards; active++) {
        expect(new Set(ranks(active, cards)).size).toBe(cards + 1);
      }
    }
  });

  it('keeps the Add card pass at the back while a card is active', () => {
    expect(ranks(0, 3)).toEqual([0, 1, 2, 3]);
    expect(ranks(2, 3)).toEqual([1, 2, 0, 3]);
  });

  it('brings the Add card pass to the front when it is the active slot', () => {
    expect(ranks(3, 3)[3]).toBe(0);
  });

  it('shows only the Add card pass when there are no cards', () => {
    expect(ranks(0, 0)).toEqual([0]);
  });
});
