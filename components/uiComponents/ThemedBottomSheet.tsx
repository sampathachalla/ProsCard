import { forwardRef, type ReactNode } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useThemedBottomSheet } from './useThemedBottomSheet';

type ThemedBottomSheetProps = {
  snapPoints: (string | number)[];
  children: ReactNode;
  enablePanDownToClose?: boolean;
};

export const ThemedBottomSheet = forwardRef<BottomSheet, ThemedBottomSheetProps>(
  ({ snapPoints, children, enablePanDownToClose = true }, ref) => {
    const { renderBackdrop, handleIndicatorStyle, backgroundStyle } = useThemedBottomSheet();

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyle}
      >
        {children}
      </BottomSheet>
    );
  },
);

ThemedBottomSheet.displayName = 'ThemedBottomSheet';
