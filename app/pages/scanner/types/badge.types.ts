import type { CardBounds } from './scanner.types';

export type BadgeContactFields = {
  name: string;
  title: string;
  company: string;
};

/** Response of POST /scanner/read-badge. */
export type BadgeReading = {
  isEventBadge: boolean;
  cardBounds: CardBounds | null;
  rotation: 0 | 90 | 180 | 270;
  printedEventName: string;
  contact: BadgeContactFields;
};
