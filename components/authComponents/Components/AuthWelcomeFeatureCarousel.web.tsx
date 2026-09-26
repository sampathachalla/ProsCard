import { useState } from 'react';
import { ScrollView, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { CreditCard, QrCode, Sparkles } from 'lucide-react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/components/uiComponents/Text';
import { PaginationDots } from '@/components/uiComponents/PaginationDots';

/** Tall enough to swipe comfortably on the card, not just the dots. */
const CAROUSEL_HEIGHT = 200;

type FeatureCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'digital-card',
    icon: CreditCard,
    title: 'Digital card',
    description: 'Keep your name, role, and contact details in one polished card.',
  },
  {
    id: 'share-qr',
    icon: QrCode,
    title: 'Share with QR',
    description: 'Let people scan and save your info in seconds—no paper needed.',
  },
  {
    id: 'edit-anytime',
    icon: Sparkles,
    title: 'Edit anytime',
    description: 'Update your look, links, and details whenever your story changes.',
  },
];

function FeatureCarouselCard({
  item,
  iconColor,
}: {
  item: FeatureCard;
  iconColor: string;
}) {
  const Icon = item.icon;

  return (
    <View className="flex-1 rounded-2xl border border-slate-200/90 bg-slate-50 px-5 py-5 dark:border-slate-300/25 dark:bg-slate-100/95">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-white dark:border-primary/20 dark:bg-white/90">
        <Icon size={24} color={iconColor} strokeWidth={2.2} />
      </View>
      <Text className="text-base font-bold text-textPrimary dark:text-slate-900">{item.title}</Text>
      <Text className="mt-2 text-[13px] leading-5 text-textMuted dark:text-slate-600">
        {item.description}
      </Text>
    </View>
  );
}

export function AuthWelcomeFeatureCarousel() {
  const [pageWidth, setPageWidth] = useState(0);
  const progress = useSharedValue(0);

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const inactiveDot = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(148,163,184,0.55)';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    progress.value = event.nativeEvent.contentOffset.x / pageWidth;
  };

  return (
    <View
      className="mt-4 w-full"
      onLayout={(event) => {
        const width = Math.round(event.nativeEvent.layout.width);
        if (width > 0 && width !== pageWidth) {
          setPageWidth(width);
        }
      }}
    >
      {pageWidth > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: pageWidth, height: CAROUSEL_HEIGHT }}
        >
          {FEATURE_CARDS.map((item) => (
            <View key={item.id} style={{ width: pageWidth, height: CAROUSEL_HEIGHT }}>
              <FeatureCarouselCard item={item} iconColor={tint} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View className="mt-4">
        <PaginationDots
          count={FEATURE_CARDS.length}
          progress={progress}
          activeColor={tint}
          inactiveColor={inactiveDot}
        />
      </View>
    </View>
  );
}
