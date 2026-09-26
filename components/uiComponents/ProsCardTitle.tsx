import { View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

type ProsCardTitleSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

const sizeStyles: Record<
  ProsCardTitleSize,
  { fontSize: number; lineHeight: number; bar: string; barMt: string }
> = {
  md: { fontSize: 36, lineHeight: 42, bar: 'w-14', barMt: 'mt-2.5' },
  lg: { fontSize: 44, lineHeight: 50, bar: 'w-[72px]', barMt: 'mt-3' },
  xl: { fontSize: 52, lineHeight: 58, bar: 'w-20', barMt: 'mt-3.5' },
  '2xl': { fontSize: 60, lineHeight: 66, bar: 'w-[88px]', barMt: 'mt-4' },
  '3xl': { fontSize: 68, lineHeight: 74, bar: 'w-[96px]', barMt: 'mt-4' },
  '4xl': { fontSize: 76, lineHeight: 82, bar: 'w-[104px]', barMt: 'mt-4' },
};

type ProsCardTitleProps = {
  size?: ProsCardTitleSize;
  /** When false, renders a solid wordmark with no accent bar. */
  accent?: boolean;
  /**
   * `initials` — only P and C use MindPROS cyan; remaining letters stay white.
   * `default` — Pros neutral, Card cyan when accent is on.
   */
  tone?: 'default' | 'initials';
};

export function ProsCardTitle({
  size = 'lg',
  accent = true,
  tone = 'default',
}: ProsCardTitleProps) {
  const styles = sizeStyles[size];
  const typeStyle = {
    fontSize: styles.fontSize,
    fontWeight: '900' as const,
    letterSpacing: -1.2,
    lineHeight: styles.lineHeight,
  };
  const cyan = 'text-primary dark:text-dark-primary';
  const white = 'text-textPrimary dark:text-dark-textPrimary';

  return (
    <View accessibilityRole="header" accessibilityLabel="ProsCard" className="items-center">
      {tone === 'initials' ? (
        <Text variant="none" className={`text-center ${white}`} style={typeStyle}>
          <Text variant="none" className={cyan} style={typeStyle}>
            P
          </Text>
          ros
          <Text variant="none" className={cyan} style={typeStyle}>
            C
          </Text>
          ard
        </Text>
      ) : (
        <Text variant="none" className={`text-center ${white}`} style={typeStyle}>
          Pros
          <Text
            variant="none"
            className={accent ? cyan : white}
            style={typeStyle}
          >
            Card
          </Text>
        </Text>
      )}
      {accent ? (
        <View className={`${styles.barMt} h-1 rounded-full bg-primary dark:bg-dark-primary ${styles.bar}`} />
      ) : null}
    </View>
  );
}
