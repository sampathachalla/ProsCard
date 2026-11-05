import { describe, expect, it } from 'vitest';
import { resolveActiveCardIndex } from '@/pages/home/Stores/activeCardStore';

const cards = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];

describe('active card shared by Home and Share', () => {
  it('finds the card the user is on', () => {
    expect(resolveActiveCardIndex(cards, 'third')).toBe(2);
  });

  it('follows the card by id when the order changes', () => {
    expect(resolveActiveCardIndex([cards[2], cards[0], cards[1]], 'third')).toBe(0);
  });

  it('falls back to the first card when none is chosen or it was deleted', () => {
    expect(resolveActiveCardIndex(cards, null)).toBe(0);
    expect(resolveActiveCardIndex(cards, 'deleted')).toBe(0);
    expect(resolveActiveCardIndex([], 'first')).toBe(0);
  });
});
