import { Text } from '@/components/uiComponents/Text';

type AppWordmarkProps = {
  className?: string;
};

export function AppWordmark({ className = '' }: AppWordmarkProps) {
  return (
    <Text
      accessibilityLabel="ProsCard"
      accessibilityRole="header"
      adjustsFontSizeToFit
      className={`text-left font-extrabold text-textPrimary dark:text-dark-textPrimary ${className}`}
      minimumFontScale={0.72}
      numberOfLines={1}
      style={{
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1.1,
        lineHeight: 38,
      }}
    >
      ProsCard
    </Text>
  );
}
