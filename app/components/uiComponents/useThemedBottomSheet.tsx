import { useCallback, useMemo } from 'react';
import { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useThemeContext } from '@/context/ThemeContext';

export function useThemedBottomSheet() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleIndicatorStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#475569' : '#cbd5e1',
      width: 40,
    }),
    [isDark],
  );

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderRadius: 28,
    }),
    [isDark],
  );

  return {
    isDark,
    renderBackdrop,
    handleIndicatorStyle,
    backgroundStyle,
  };
}
