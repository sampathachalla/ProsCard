import { useEffect, useState } from 'react';

import { DEFAULT_QR_CUSTOMIZATION } from '../Config/qrCustomizationDefaults';
import {
  readQrCustomization,
  subscribeQrCustomization,
} from '../Services/qrCustomizationStorage';
import type { QrCustomization } from '../types/share.types';

/** Keeps every in-app representation of a card in sync with its Share-page QR choices. */
export function useQrCustomization(cardId: string | null | undefined): QrCustomization {
  const [customization, setCustomization] = useState<QrCustomization>(DEFAULT_QR_CUSTOMIZATION);

  useEffect(() => {
    let cancelled = false;
    setCustomization(DEFAULT_QR_CUSTOMIZATION);

    if (cardId) {
      readQrCustomization(cardId)
        .then((saved) => {
          if (!cancelled) setCustomization(saved);
        })
        .catch(() => {
          if (!cancelled) setCustomization(DEFAULT_QR_CUSTOMIZATION);
        });
    }

    const unsubscribe = subscribeQrCustomization((changedCardId, next) => {
      if (changedCardId === cardId) setCustomization(next);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cardId]);

  return customization;
}
