import type { BusinessCard, CardVisualTheme, SavedSectionTheme } from '@/pages/cards/types/card.types';
import { CardStylingCustomizer } from '@/pages/editView/Components/CardThemeCustomizer';
import { AddCardSheet } from './AddCardSheet';

type Props = {
  card: BusinessCard;
  visible: boolean;
  onClose: () => void;
  onChange: (theme: CardVisualTheme) => void;
  onSaveCustomTheme: (entry: SavedSectionTheme) => void;
};

/** Reuses the card editor's theme + font customizer; the choice applies to the whole card. */
export function ThemeSheet({ card, visible, onClose, onChange, onSaveCustomTheme }: Props) {
  return (
    <AddCardSheet title="Card theme" visible={visible} onClose={onClose}>
      <CardStylingCustomizer
        embedded
        fullOpen
        editBarCollapsed
        backLabel="Back to card"
        customThemes={card.customThemes ?? []}
        sectionId="identity"
        theme={card.cardTheme}
        onBack={onClose}
        onChange={onChange}
        onSaveCustomTheme={onSaveCustomTheme}
      />
    </AddCardSheet>
  );
}
