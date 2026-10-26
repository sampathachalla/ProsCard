import { View } from 'react-native';
import { Text } from '@/common/ui/Text';
import type { BusinessCard, CardLayoutId, CardSectionId } from '@/pages/cards/types/card.types';
import { LayoutTemplatePicker } from '@/pages/editView/Components/LayoutTemplatePicker';
import { AddCardSheet } from './AddCardSheet';

const LAYOUT_SECTIONS: { id: CardSectionId; title: string; hint: string }[] = [
  { id: 'identity', title: 'Header', hint: 'How the cover, photo and logo are arranged.' },
  { id: 'professional', title: 'Details', hint: 'How your name, title and company are presented.' },
];

type Props = {
  card: BusinessCard;
  visible: boolean;
  onClose: () => void;
  onChange: (section: CardSectionId, layout: CardLayoutId) => void;
};

/** Reuses the card editor's layout picker for the header and details sections. */
export function LayoutSheet({ card, visible, onClose, onChange }: Props) {
  return (
    <AddCardSheet title="Layout" visible={visible} onClose={onClose}>
      {LAYOUT_SECTIONS.map((section) => (
        <View key={section.id} className="mb-6">
          <Text variant="subtitle">{section.title}</Text>
          <Text variant="muted" className="mb-3">
            {section.hint}
          </Text>
          <LayoutTemplatePicker
            fullOpen
            showHeader={false}
            section={section.id}
            selectedTemplateId={card.sectionLayouts[section.id]}
            theme={card.sectionThemes[section.id]}
            onSelect={(layout) => onChange(section.id, layout)}
          />
        </View>
      ))}
    </AddCardSheet>
  );
}
