import type { CardDetailSection as CardDetailSectionData } from '@/pages/cards/Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '@/pages/cards/Templates/SectionTemplateRenderer';
import type { CardVisualTheme } from '@/pages/cards/types/card.types';

export function CardDetailSection({ cardTheme, gradient, section, showEmpty = false }: { cardTheme: CardVisualTheme; gradient: [string, string]; section: CardDetailSectionData; showEmpty?: boolean }) {
  return <SectionTemplateRenderer cardTheme={cardTheme} gradient={gradient} section={section} showEmpty={showEmpty} />;
}
