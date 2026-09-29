import { View } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardVisualTheme, ResolvedLayoutSlots } from '../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';

type WalletTextProps = {
  align?: 'left' | 'center' | 'right';
  cardTheme: CardVisualTheme;
  children: string;
  color: string;
  lines?: number;
  size?: 'xs' | 'sm' | 'md';
  weight?: 'bold' | 'black' | 'semibold';
};

const sizeMap = {
  xs: { className: 'text-[10px] leading-tight', scale: 0.72 },
  sm: { className: 'text-xs leading-tight', scale: 0.75 },
  md: { className: 'text-sm leading-tight', scale: 0.78 },
} as const;

export function WalletPassText({
  align = 'left',
  cardTheme,
  children,
  color,
  lines = 2,
  size = 'sm',
  weight = 'black',
}: WalletTextProps) {
  const fontWeight = weight === 'black' ? '900' : weight === 'bold' ? '800' : '600';
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
  align = 'center',
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
    <WalletPassText align={align} cardTheme={cardTheme} color={slots.textPrimary} lines={2} size="sm">
      {display}
    </WalletPassText>
  );
}

export function WalletPassRoleBlock({
  align = 'center',
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
    <View className={`mt-0.5 w-full ${align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start'}`}>
      <WalletPassText align={align} cardTheme={cardTheme} color={slots.textPrimary} lines={1} size="xs" weight="bold">
        {title}
      </WalletPassText>
      <View className={`mt-0.5 flex-row items-center ${rowAlign}`}>
        <Building2 color={slots.textSecondary} size={10} />
        <WalletPassText
          align={align}
          cardTheme={cardTheme}
          color={slots.textSecondary}
          lines={1}
          size="xs"
          weight="semibold"
        >
          {` ${company}`}
        </WalletPassText>
      </View>
    </View>
  );
}

export function WalletPassAccentRule({
  align = 'center',
  color,
  width = 40,
}: {
  align?: 'left' | 'center' | 'right';
  color: string;
  width?: number;
}) {
  return (
    <View
      className={`my-1 h-0.5 rounded-full ${align === 'center' ? 'self-center' : align === 'right' ? 'self-end' : 'self-start'}`}
      style={{ backgroundColor: color, width }}
    />
  );
}
