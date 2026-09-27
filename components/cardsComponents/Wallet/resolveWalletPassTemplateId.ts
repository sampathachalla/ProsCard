import type { BusinessCard, CardTemplateId } from '../types/card.types';

/** Same 12 templates as identity / professional / bio / connections in the editor. */
export const WALLET_PASS_TEMPLATE_IDS = [
  'classic',
  'minimal',
  'bold',
  'glass',
  'compact',
  'editorial',
  'spotlight',
  'banner',
  'cards',
  'badge',
  'split',
  'neon',
] as const satisfies readonly CardTemplateId[];

export type WalletPassTemplateId = (typeof WALLET_PASS_TEMPLATE_IDS)[number];

export type WalletPassLayouts = {
  identity: CardTemplateId;
  professional: CardTemplateId;
};

/** Layout templates on the card; wallet stack renders section 1 (identity) only. */
export function resolveWalletPassLayouts(card: BusinessCard): WalletPassLayouts {
  return {
    identity: card.sectionLayouts.identity,
    professional: card.sectionLayouts.professional,
  };
}

/**
 * @deprecated Use `resolveWalletPassLayouts(card).identity` — wallet uses per-section layouts.
 */
export function resolveWalletPassTemplateId(card: BusinessCard): CardTemplateId {
  return card.sectionLayouts.identity;
}
