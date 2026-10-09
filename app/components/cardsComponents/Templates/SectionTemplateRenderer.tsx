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
  homepagePreview?: boolean;
  /** Let supported full-card sections size themselves from rendered content. */
  contentDriven?: boolean;
  /** Keep authored font sizes. Home-card faces omit this and may still shrink to fit. */
  preserveTypeScale?: boolean;
  cardMetadata?: {
    name?: string;
    title?: string;
    company?: string;
    id?: string;
  };
  interactiveActions?: boolean;
  onSaveContact?: () => void;
  onShareCard?: () => void;
};

export function SectionTemplateRenderer({
  cardMetadata,
  compact = false,
  cardTheme,
  gradient,
  interactiveActions,
  onSaveContact,
  onShareCard,
  section,
  seamless = false,
  showEmpty = false,
  walletPass = false,
  fullCardView = false,
  homepagePreview = false,
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
          cardMetadata={cardMetadata}
          compact={compact}
          cardTheme={cardTheme}
          contentDriven={contentDriven}
          fullCardView={fullCardView}
          gradient={gradient}
          homepagePreview={homepagePreview}
          interactiveActions={interactiveActions}
          onSaveContact={onSaveContact}
          onShareCard={onShareCard}
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
