import { describe, expect, it } from 'vitest';
import {
  getBusinessCardHeight,
  getHomePreviewCardDimensions,
  HOME_PREVIEW_ASPECT_RATIO,
  HOME_PREVIEW_WIDTH_FRACTION,
  HOME_PREVIEW_VERTICAL_MARGIN,
} from '@/pages/home/Utils/businessCardLayout';

describe('homepage business-card sizing', () => {
  it('uses the taller preview range when vertical space is available', () => {
    expect(getBusinessCardHeight(340, 730)).toBe(730);
  });

  it('never extends beyond the available showcase height', () => {
    expect(getBusinessCardHeight(340, 620)).toBe(620);
  });

  it('matches Popl-style width and 1:1.6 aspect when showcase allows', () => {
    const viewportWidth = 390;
    const showcaseHeight = 620;
    const { width, height } = getHomePreviewCardDimensions(viewportWidth, showcaseHeight, 1);
    expect(width).toBe(Math.round(viewportWidth * HOME_PREVIEW_WIDTH_FRACTION));
    expect(height).toBe(Math.round(width * HOME_PREVIEW_ASPECT_RATIO));
  });

  it('shrinks width when showcase height is tight but keeps aspect ratio', () => {
    const viewportWidth = 390;
    const showcaseHeight = 520;
    const maxHeight = showcaseHeight - HOME_PREVIEW_VERTICAL_MARGIN;
    const { width, height } = getHomePreviewCardDimensions(viewportWidth, showcaseHeight, 1);
    expect(height).toBe(Math.round(maxHeight));
    expect(width).toBe(Math.round(height / HOME_PREVIEW_ASPECT_RATIO));
  });
});
