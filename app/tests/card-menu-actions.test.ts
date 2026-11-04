import { describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react-native', () => {
  const Dummy = () => null;
  return { Copy: Dummy, Eye: Dummy, Pencil: Dummy, Share2: Dummy, Wallet: Dummy };
});
import { CARD_MENU_ACTIONS } from '@/pages/cards/Config/cardMenuActions';

describe('card options menu', () => {
  it('does not expose the removed lock-screen action', () => {
    expect(CARD_MENU_ACTIONS.some((action) => action.id === 'lockscreen')).toBe(false);
  });
});
