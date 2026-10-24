import { useRef } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/common/ui/Text';
import type { CardSectionId } from '@/pages/cards/types/card.types';
import { SECTION_CHOICES } from '../editViewConstants';

type Props = {
  bottomInset: number;
  visible: boolean;
  windowWidth: number;
  onChoose: (section: CardSectionId) => void;
  onClose: () => void;
};

/** "Choose a section" sheet. Dragging down from the top of its list closes it. */
export function SectionPickerModal({ bottomInset, visible, windowWidth, onChoose, onClose }: Props) {
  const scrollY = useRef(0);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number | null>(null);

  const startDrag = (pageY: number) => {
    dragStartY.current = scrollY.current <= 2 ? pageY : null;
    dragCurrentY.current = pageY;
  };
  const finishDrag = () => {
    const startY = dragStartY.current;
    const currentY = dragCurrentY.current;
    dragStartY.current = null;
    dragCurrentY.current = null;
    if (startY !== null && currentY !== null && currentY - startY >= 64) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onClose();
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}>
      <Pressable className="flex-1 justify-end bg-slate-950/65" onPress={onClose}>
        <Pressable
          className="max-h-[72%] rounded-t-[30px] border-t border-slate-200 bg-background px-5 pt-3 dark:border-slate-700 dark:bg-dark-background"
          onPress={(event) => event.stopPropagation()}
          onTouchCancel={finishDrag}
          onTouchEnd={finishDrag}
          onTouchMove={(event) => {
            dragCurrentY.current = event.nativeEvent.touches[0]?.pageY ?? dragCurrentY.current;
          }}
          onTouchStart={(event) => startDrag(event.nativeEvent.touches[0]?.pageY ?? 0)}
          style={{ paddingBottom: Math.max(bottomInset, 18) }}
        >
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
          </View>
          <Text className="text-xl font-black text-textPrimary dark:text-dark-textPrimary">Choose a section</Text>
          <Text variant="muted" className="mb-4 mt-1">
            Select the part of this card you want to customize.
          </Text>
          <ScrollView
            onScroll={(event) => {
              scrollY.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap gap-3 pb-3">
              {SECTION_CHOICES.map(({ description, icon: Icon, id, title }) => (
                <Pressable
                  accessibilityLabel={`Customize ${title}`}
                  accessibilityRole="button"
                  className="min-h-28 rounded-2xl border border-slate-200 bg-card p-4 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
                  key={id}
                  onPress={() => onChoose(id)}
                  style={{
                    width: windowWidth < 380 ? '100%' : (windowWidth - 52) / 2,
                  }}
                >
                  <View className="mb-3 size-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                    <Icon color="#3b82f6" size={19} />
                  </View>
                  <Text className="font-bold text-textPrimary dark:text-dark-textPrimary">{title}</Text>
                  <Text variant="muted" className="mt-1 text-xs" numberOfLines={2}>
                    {description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
