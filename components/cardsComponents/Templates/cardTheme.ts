import type { CardFontStyle } from '../types/card.types';
import { Platform } from 'react-native';

export function getCardFontFamily(fontStyle: CardFontStyle): string | undefined {
  if (fontStyle === 'classic') return Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' });
  if (fontStyle === 'rounded') return Platform.select({ ios: 'Arial Rounded MT Bold', android: 'sans-serif-medium', web: 'Arial Rounded MT Bold, Arial, sans-serif' });
  if (fontStyle === 'mono') return Platform.select({ ios: 'Menlo', android: 'monospace', web: 'Menlo, monospace' });
  return Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui, sans-serif' });
}

export function getCardLetterSpacing(fontStyle: CardFontStyle): number {
  if (fontStyle === 'rounded') return 0.6;
  if (fontStyle === 'mono') return 0.2;
  return 0;
}
