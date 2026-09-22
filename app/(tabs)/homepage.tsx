import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type BottomSheet from '@gorhom/bottom-sheet';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { CardShowcaseSection } from '@/components/homepageComponents/Components/CardShowcaseSection';
import { CategoryBottomSheet } from '@/components/homepageComponents/Components/CategoryBottomSheet';
import { HomeActions } from '@/components/homepageComponents/Components/HomeActions';
import { HomeHeader } from '@/components/homepageComponents/Components/HomeHeader';

export default function HomepageScreen() {
  const { cards } = useCards();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const categorySheetRef = useRef<BottomSheet>(null);

  const currentCard = cards[activeCardIndex] ?? cards[0];
  const userName = currentCard?.name ?? 'ProsCard User';

  const handleOpenCategorySheet = () => {
    categorySheetRef.current?.expand();
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="px-5 pb-3 pt-2">
        <HomeHeader userName={userName} />
      </View>

      <ScrollView
        automaticallyAdjustContentInsets={false}
        className="flex-1"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 8, 20) }}
        showsVerticalScrollIndicator={false}
      >
        <CardShowcaseSection
          activeIndex={activeCardIndex}
          cards={cards}
          onActiveIndexChange={setActiveCardIndex}
          onCardTitlePress={handleOpenCategorySheet}
        />

        <View className="px-5 pt-3">
          <HomeActions />
        </View>
      </ScrollView>


      {/* Interactive Bottom Sheets */}
      <CategoryBottomSheet
        ref={categorySheetRef}
        cards={cards}
        selectedIndex={activeCardIndex}
        onSelectCard={setActiveCardIndex}
      />
    </View>
  );
}
