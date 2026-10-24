import type { CardDetailSection as CardDetailSectionData } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';
import type { CardVisualTheme } from '../types/card.types';

export function CardDetailSection({ cardTheme, gradient, section, showEmpty = false }: { cardTheme: CardVisualTheme; gradient: [string, string]; section: CardDetailSectionData; showEmpty?: boolean }) {
  return <SectionTemplateRenderer cardTheme={cardTheme} gradient={gradient} section={section} showEmpty={showEmpty} />;
}
