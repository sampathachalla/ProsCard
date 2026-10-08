import React from 'react';
import type { CardDetailSection } from './cardDetailTemplate';
import type { CardVisualTheme } from '../types/card.types';
import { WalletIdentityPassRenderer } from '../Wallet/WalletIdentityPassRenderer';
import { WalletProfessionalPassRenderer } from '../Wallet/WalletProfessionalPassRenderer';
import { IdentitySectionRenderer } from './sections/IdentitySectionRenderer';
import { ProfessionalSectionRenderer } from './sections/ProfessionalSectionRenderer';
import { BioSectionRenderer } from './sections/BioSectionRenderer';
import { ConnectionsSectionRenderer } from './sections/ConnectionsSectionRenderer';

export type SectionTemplateRendererProps = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
  walletPass?: boolean;
  fullCardView?: boolean;
  /** Let the professional section size itself from its rendered content. */
  contentDriven?: boolean;
  /** Keep authored font sizes. Home-card faces omit this and may still shrink to fit. */
  preserveTypeScale?: boolean;
};

export function SectionTemplateRenderer({
  compact = false,
  cardTheme,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
  walletPass = false,
  fullCardView = false,
  contentDriven = false,
  preserveTypeScale = false,
}: SectionTemplateRendererProps) {
  if (!section) return null;

  switch (section.id) {
    case 'identity':
      if (walletPass) {
        return (
          <WalletIdentityPassRenderer cardTheme={cardTheme} gradient={gradient} section={section} />
        );
      }
      return (
        <IdentitySectionRenderer
          compact={compact}
          cardTheme={cardTheme}
          fullCardView={fullCardView}
          gradient={gradient}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    case 'professional':
      if (walletPass) {
        return (
          <WalletProfessionalPassRenderer cardTheme={cardTheme} gradient={gradient} section={section} />
        );
      }
      return (
        <ProfessionalSectionRenderer
          compact={compact}
          cardTheme={cardTheme}
          contentDriven={contentDriven}
          fullCardView={fullCardView}
          gradient={gradient}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    case 'bio':
      return (
        <BioSectionRenderer
          compact={compact}
          cardTheme={cardTheme}
          fullCardView={fullCardView}
          gradient={gradient}
          preserveTypeScale={preserveTypeScale}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    case 'connections':
      return (
        <ConnectionsSectionRenderer
          compact={compact}
          cardTheme={cardTheme}
          fullCardView={fullCardView}
          gradient={gradient}
          preserveTypeScale={preserveTypeScale}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    default:
      return null;
  }
}
