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
          gradient={gradient}
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
          gradient={gradient}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    default:
      return null;
  }
}
