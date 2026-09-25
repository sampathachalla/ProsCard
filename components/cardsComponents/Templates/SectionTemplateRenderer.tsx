import React from 'react';
import type { CardDetailSection } from './cardDetailTemplate';
import type { CardVisualTheme } from '../types/card.types';
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
};

export function SectionTemplateRenderer({
  compact = false,
  cardTheme,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
}: SectionTemplateRendererProps) {
  if (!section) return null;

  switch (section.id) {
    case 'identity':
      return (
        <IdentitySectionRenderer
          compact={compact}
          cardTheme={cardTheme}
          gradient={gradient}
          section={section}
          seamless={seamless}
          showEmpty={showEmpty}
        />
      );

    case 'professional':
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
