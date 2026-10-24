import { Text } from '@/common/ui/Text';

type AppWordmarkProps = {
  className?: string;
};

export function AppWordmark({ className = '' }: AppWordmarkProps) {
  return (
    <Text
      accessibilityLabel="VC Pros"
      accessibilityRole="header"
      adjustsFontSizeToFit
      className={`text-left font-extrabold text-textPrimary dark:text-dark-textPrimary ${className}`}
      minimumFontScale={0.72}
      numberOfLines={1}
      style={{
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1.2,
        lineHeight: 46,
      }}
    >
      <Text variant="none" className="text-primary dark:text-dark-primary">
        VC
      </Text>{' '}
      Pros
    </Text>
  );
}
