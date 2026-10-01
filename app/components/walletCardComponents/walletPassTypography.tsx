import React from 'react';
import { View } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardVisualTheme, ResolvedLayoutSlots } from '@/components/cardsComponents/types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '@/components/cardsComponents/Templates/cardTheme';

type WalletTextProps = {
  align?: 'left' | 'center' | 'right';
  cardTheme: CardVisualTheme;
  children: React.ReactNode;
  color: string;
  lines?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'bold' | 'black' | 'semibold' | 'normal';
};

const sizeMap = {
  xs: { className: 'text-xs leading-tight', scale: 0.8 },
  sm: { className: 'text-[13px] leading-tight', scale: 0.82 },
  md: { className: 'text-[15px] leading-snug', scale: 0.85 },
  lg: { className: 'text-[17px] leading-snug', scale: 0.88 },
  xl: { className: 'text-[19px] leading-tight', scale: 0.9 },
} as const;

export function WalletPassText({
  align = 'left',
  cardTheme,
  children,
  color,
  lines = 2,
  size = 'md',
  weight = 'bold',
}: WalletTextProps) {
  const fontWeight = weight === 'black' ? '900' : weight === 'bold' ? '800' : weight === 'semibold' ? '600' : '500';
  return (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={sizeMap[size].scale}
      numberOfLines={lines}
      className={sizeMap[size].className}
      style={{
        color,
        fontFamily: getCardFontFamily(cardTheme.fontStyle),
        fontWeight,
        letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
        textAlign: align,
      }}
    >
      {children}
    </Text>
  );
}

export function WalletPassNameBlock({
  accreditations,
  align = 'left',
  cardTheme,
  name,
  slots,
}: {
  accreditations?: string;
  align?: 'left' | 'center' | 'right';
  cardTheme: CardVisualTheme;
  name: string;
  slots: ResolvedLayoutSlots;
}) {
  const display = [name, accreditations?.trim()].filter(Boolean).join(', ');
  return (
    <WalletPassText align={align} cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="md" weight="bold">
      {display}
    </WalletPassText>
  );
}

export function WalletPassRoleBlock({
  align = 'left',
  cardTheme,
  company,
  slots,
  title,
}: {
  align?: 'left' | 'center' | 'right';
  cardTheme: CardVisualTheme;
  company: string;
  slots: ResolvedLayoutSlots;
  title: string;
}) {
  const rowAlign = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';
  return (
    <View className={`mt-1 w-full ${align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start'}`}>
      <WalletPassText align={align} cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="lg" weight="black">
        {title}
      </WalletPassText>
      <View className={`mt-1 flex-row items-center ${rowAlign}`}>
        <Building2 color={slots.textSecondary} size={13} />
        <WalletPassText
          align={align}
          cardTheme={cardTheme}
          color={slots.textSecondary}
          lines={1}
          size="sm"
          weight="semibold"
        >
          {` ${company}`}
        </WalletPassText>
      </View>
    </View>
  );
}

export function WalletPassAccentRule({
  align = 'left',
  color,
  width = 36,
}: {
  align?: 'left' | 'center' | 'right';
  color: string;
  width?: number;
}) {
  return (
    <View
      className={`my-1.5 h-0.5 rounded-full ${align === 'center' ? 'self-center' : align === 'right' ? 'self-end' : 'self-start'}`}
      style={{ backgroundColor: color, width }}
    />
  );
}
