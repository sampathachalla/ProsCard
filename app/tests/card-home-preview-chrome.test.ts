import { describe, expect, it } from 'vitest';
import {
  HOME_PREVIEW_CARD_BORDER_RADIUS,
  HOME_PREVIEW_OUTER_BORDER_WIDTH,
  resolveHomePreviewChromeBorder,
  resolveHomePreviewOuterChromeStyle,
} from '@/utils/cardThemeColor';

describe('home preview chrome', () => {
  it('uses a stronger border on light surfaces than the full-card chrome', () => {
    const home = resolveHomePreviewChromeBorder('#ffffff');
    expect(home).toBe('rgba(15, 23, 42, 0.34)');
  });

  it('outer shell keeps border outside the clip layer', () => {
    const chrome = resolveHomePreviewChromeBorder('#ffffff', '#2563eb');
    const { innerClipRadius, outer } = resolveHomePreviewOuterChromeStyle({
      chromeBorder: chrome,
      height: 400,
      surfaceColor: '#ffffff',
      width: 320,
    });
    expect(outer.borderWidth).toBe(HOME_PREVIEW_OUTER_BORDER_WIDTH);
    expect(outer.borderRadius).toBe(HOME_PREVIEW_CARD_BORDER_RADIUS);
    expect(innerClipRadius).toBe(HOME_PREVIEW_CARD_BORDER_RADIUS - HOME_PREVIEW_OUTER_BORDER_WIDTH);
    expect(outer.borderColor).toBe(chrome);
  });
});
