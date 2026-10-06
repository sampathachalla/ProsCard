import {
  IDENTITY_SECTION_TEMPLATE_IDS,
  resolveIdentityTemplateId,
  resolveLayoutStyle,
  type BusinessCard,
  type CardTemplateId,
} from '../types/card.types';

/** Identity wallet header layouts (section 1). */
export const WALLET_IDENTITY_TEMPLATE_IDS = IDENTITY_SECTION_TEMPLATE_IDS;

export type WalletIdentityTemplateId = (typeof WALLET_IDENTITY_TEMPLATE_IDS)[number];

export type WalletPassLayouts = {
  identity: CardTemplateId;
  professional: CardTemplateId;
};

/** Layout templates on the card; wallet stack renders section 1 (identity) only. */
export function resolveWalletPassLayouts(card: BusinessCard): WalletPassLayouts {
  return {
    identity: resolveIdentityTemplateId(card.sectionLayouts.identity),
    professional: resolveLayoutStyle(card.sectionLayouts.professional, 'professional'),
  };
}

/**
 * @deprecated Use `resolveWalletPassLayouts(card).identity` — wallet uses per-section layouts.
 */
export function resolveWalletPassTemplateId(card: BusinessCard): CardTemplateId {
  return resolveIdentityTemplateId(card.sectionLayouts.identity);
}
