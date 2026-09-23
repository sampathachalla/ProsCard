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
  onChange?: (index: number) => void;
  topInset?: number;
};

export const ThemedBottomSheet = forwardRef<BottomSheet, ThemedBottomSheetProps>(
  ({ snapPoints, children, backdropEnabled = true, containerStyle, enablePanDownToClose = true, footer, onChange, topInset = 0 }, ref) => {
    const { renderBackdrop, handleIndicatorStyle, backgroundStyle } = useThemedBottomSheet();
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
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={backdropEnabled ? renderBackdrop : undefined}
        footerComponent={footer ? renderFooter : undefined}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyle}
        onChange={onChange}
      >
        {children}
      </BottomSheet>
    );
  },
);

ThemedBottomSheet.displayName = 'ThemedBottomSheet';
