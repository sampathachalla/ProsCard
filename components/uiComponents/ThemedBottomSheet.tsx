import { forwardRef, useCallback, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import BottomSheet, { BottomSheetFooter, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { useThemedBottomSheet } from './useThemedBottomSheet';

type ThemedBottomSheetProps = {
  snapPoints: (string | number)[];
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backdropEnabled?: boolean;
  enablePanDownToClose?: boolean;
  footer?: ReactNode;
  glassmorphic?: boolean;
  onChange?: (index: number) => void;
  topInset?: number;
};

export const ThemedBottomSheet = forwardRef<BottomSheet, ThemedBottomSheetProps>(
  ({ snapPoints, children, backdropEnabled = true, containerStyle, enablePanDownToClose = true, footer, glassmorphic = false, onChange, topInset = 0 }, ref) => {
    const { isDark, renderBackdrop, handleIndicatorStyle, backgroundStyle } = useThemedBottomSheet();
    const renderTransparentBackdrop = useCallback(() => null, []);
    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => <BottomSheetFooter {...props}>{footer}</BottomSheetFooter>,
      [footer],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        containerStyle={containerStyle}
        topInset={topInset}
        enableDynamicSizing={false}
        enablePanDownToClose={enablePanDownToClose}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={backdropEnabled ? renderBackdrop : renderTransparentBackdrop}
        footerComponent={footer ? renderFooter : undefined}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={
          glassmorphic
            ? {
                ...backgroundStyle,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.84)',
                borderColor: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.34)',
                borderWidth: 1,
              }
            : backgroundStyle
        }
        onChange={onChange}
      >
        {children}
      </BottomSheet>
    );
  },
);

ThemedBottomSheet.displayName = 'ThemedBottomSheet';
