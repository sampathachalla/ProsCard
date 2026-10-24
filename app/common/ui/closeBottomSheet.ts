import type BottomSheet from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

export function closeBottomSheet(ref: RefObject<BottomSheet | null>) {
  ref.current?.close();
}
