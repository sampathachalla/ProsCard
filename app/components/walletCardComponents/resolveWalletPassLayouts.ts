import {
  IDENTITY_SECTION_TEMPLATE_IDS,
  PROFESSIONAL_LAYOUT_STYLES,
  resolveIdentityLayoutId,
  resolveIdentityTemplateId,
  resolveLayoutStyle,
  resolveProfessionalLayoutId,
  type BusinessCard,
  type CardTemplateId,
  type IdentityLayoutId,
  type IdentitySectionTemplateId,
  type ProfessionalLayoutId,
} from '@/components/cardsComponents/types/card.types';

/** Identity wallet header layouts (section 1) — same styles as full-view identity. */
export const WALLET_IDENTITY_TEMPLATE_IDS = IDENTITY_SECTION_TEMPLATE_IDS;

export type WalletIdentityTemplateId = IdentitySectionTemplateId;

/** Professional wallet band layouts (section 2) — same styles as full-view professional. */
export const WALLET_PROFESSIONAL_TEMPLATE_IDS = [
  PROFESSIONAL_LAYOUT_STYLES['layout-1'],
  PROFESSIONAL_LAYOUT_STYLES['layout-2'],
  PROFESSIONAL_LAYOUT_STYLES['layout-3'],
  PROFESSIONAL_LAYOUT_STYLES['layout-4'],
  PROFESSIONAL_LAYOUT_STYLES['layout-5'],
  PROFESSIONAL_LAYOUT_STYLES['layout-6'],
  PROFESSIONAL_LAYOUT_STYLES['layout-7'],
] as const satisfies readonly CardTemplateId[];

export type WalletProfessionalTemplateId = (typeof WALLET_PROFESSIONAL_TEMPLATE_IDS)[number];

export type WalletPassLayouts = {
  /** Stable identity layout id stored on the card (`layout-1` … `layout-6`). */
  identityLayoutId: IdentityLayoutId;
  /** Stable professional layout id stored on the card (`layout-1` … `layout-7`). */
  professionalLayoutId: ProfessionalLayoutId;
  /** Resolved style for the identity band (e.g. classic, minimal, spotlight). */
  identity: IdentitySectionTemplateId;
  /** Resolved style for the professional band (e.g. classic, banner, neon). */
  professional: CardTemplateId;
};

/**
 * Resolves the wallet pass layouts from the same `sectionLayouts` the full card
 * view uses. Layout ids (`layout-1` …) and legacy style names both map to the
 * visual style each pass renderer draws.
 */
export function resolveWalletPassLayouts(card: BusinessCard): WalletPassLayouts {
  return {
    identityLayoutId: resolveIdentityLayoutId(card.sectionLayouts.identity),
    professionalLayoutId: resolveProfessionalLayoutId(card.sectionLayouts.professional),
    identity: resolveIdentityTemplateId(card.sectionLayouts.identity),
    professional: resolveLayoutStyle(card.sectionLayouts.professional, 'professional'),
  };
}
