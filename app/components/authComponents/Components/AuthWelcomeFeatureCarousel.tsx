import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { CreditCard, QrCode, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/components/uiComponents/Text';
import { PaginationDots } from '@/components/uiComponents/PaginationDots';

const CAROUSEL_HEIGHT = 196;
const SIDE_PEEK = 18;

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
  isDark,
}: {
  item: FeatureCard;
  iconColor: string;
  isDark: boolean;
}) {
  const Icon = item.icon;

  return (
    <View
      className={`flex-1 overflow-hidden rounded-[28px] border ${
        isDark
          ? 'border-white/10 bg-slate-900/70'
          : 'border-slate-200/80 bg-white/95'
      }`}
      style={{
        shadowColor: isDark ? '#000' : '#0f172a',
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(56,189,248,0.12)', 'rgba(15,23,42,0.2)', 'transparent']
            : ['rgba(37,99,235,0.08)', 'rgba(255,255,255,0.9)', 'transparent']
        }
        locations={[0, 0.35, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, paddingHorizontal: 22, paddingVertical: 22 }}
      >
        <View className="flex-1 items-center justify-center">
          <View
            className={`mb-4 h-14 w-14 items-center justify-center rounded-full border ${
              isDark
                ? 'border-sky-400/25 bg-sky-400/10'
                : 'border-primary/20 bg-primary/10'
            }`}
          >
            <Icon size={24} color={iconColor} strokeWidth={2.1} />
          </View>

          <Text
            className={`text-center text-[18px] font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-textPrimary'
            }`}
          >
            {item.title}
          </Text>
          <Text
            className={`mt-2 max-w-[260px] text-center text-[13px] leading-5 ${
              isDark ? 'text-slate-300' : 'text-textMuted'
            }`}
          >
            {item.description}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export function AuthWelcomeFeatureCarousel() {
  const [pageWidth, setPageWidth] = useState(0);
  const progress = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const inactiveDot = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.5)';
  const pageSize = pageWidth > 0 ? pageWidth - SIDE_PEEK * 2 : 0;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageSize > 0) {
      progress.value = event.nativeEvent.contentOffset.x / pageSize;
    }
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
      {pageSize > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={pageSize}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={{ paddingHorizontal: SIDE_PEEK }}
          style={{ width: pageWidth, height: CAROUSEL_HEIGHT }}
        >
          {FEATURE_CARDS.map((item) => (
            <View
              key={item.id}
              style={{
                width: pageSize,
                height: CAROUSEL_HEIGHT,
                paddingHorizontal: 6,
              }}
            >
              <FeatureCarouselCard item={item} iconColor={tint} isDark={isDark} />
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
