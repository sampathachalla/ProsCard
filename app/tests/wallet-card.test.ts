import { describe, expect, it, vi } from 'vitest';
import {
  getWalletCardDimensions,
  resolveWalletCardWidth,
  WALLET_PASS_WIDTH_TO_HEIGHT,
  WALLET_IDENTITY_HEIGHT_RATIO,
  WALLET_PROFESSIONAL_HEIGHT_RATIO,
} from '@/components/walletCardComponents/walletCardLayout';
import { resolveWalletPassLayouts } from '@/components/walletCardComponents/resolveWalletPassLayouts';
import { walletStackRankFor } from '@/components/walletCardComponents/WalletStackView';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';

vi.mock('@/components/walletCardComponents/WalletDesignEngine', () => ({ WalletDesignEngine: () => null }));
vi.mock('@/components/walletCardComponents/WalletCardRenderEngine', () => ({ WalletCardRenderEngine: () => null }));
vi.mock('react-native', () => ({}));
vi.mock('react-native-reanimated', () => ({}));
vi.mock('lucide-react-native', () => ({}));
vi.mock('react-native-qrcode-svg', () => ({}));
vi.mock('@/components/uiComponents/Text', () => ({}));

function layoutsCard(identity: string, professional: string): BusinessCard {
  return {
    sectionLayouts: { identity, professional, bio: 'classic', connections: 'classic' },
  } as BusinessCard;
}

describe('walletCardComponents - traditional ID-1 layout engine', () => {
  it('calculates traditional ID-1 wallet dimensions correctly', () => {
    const width = 340;
    const dims = getWalletCardDimensions(width);
    expect(dims.width).toBe(340);
    expect(dims.height).toBe(Math.round(340 / WALLET_PASS_WIDTH_TO_HEIGHT));
    expect(dims.identityHeight + dims.professionalHeight).toBe(dims.height);
  });

  it('respects available height constraints with ID-1 proportions', () => {
    const width = 320;
    const availableHeight = 220;
    const dims = getWalletCardDimensions(width, availableHeight);
    expect(dims.height).toBeLessThanOrEqual(availableHeight);
    expect(dims.identityHeight).toBe(Math.round(dims.height * WALLET_IDENTITY_HEIGHT_RATIO));
    expect(dims.professionalHeight).toBe(dims.height - dims.identityHeight);
  });

  it('resolves responsive wallet card width', () => {
    const windowWidth = 390;
    const width = resolveWalletCardWidth({ windowWidth });
    expect(width).toBeGreaterThanOrEqual(270);
    expect(width).toBeLessThanOrEqual(370);
  });

  it('correctly ranks wallet stack cards and add-pass', () => {
    expect(walletStackRankFor(0, 0, 3)).toBe(0);
    expect(walletStackRankFor(1, 0, 3)).toBe(1);
    expect(walletStackRankFor(2, 0, 3)).toBe(2);
    expect(walletStackRankFor(3, 0, 3)).toBe(3);

    expect(walletStackRankFor(2, 2, 3)).toBe(0);
    expect(walletStackRankFor(3, 2, 3)).toBe(3);
  });

  it('maps full-view layout ids to the matching wallet design styles', () => {
    expect(resolveWalletPassLayouts(layoutsCard('layout-2', 'layout-4'))).toMatchObject({
      identityLayoutId: 'layout-2',
      professionalLayoutId: 'layout-4',
      identity: 'minimal',
      professional: 'banner',
    });

    expect(resolveWalletPassLayouts(layoutsCard('spotlight', 'neon'))).toMatchObject({
      identityLayoutId: 'layout-5',
      professionalLayoutId: 'layout-7',
      identity: 'spotlight',
      professional: 'neon',
    });
  });
});
