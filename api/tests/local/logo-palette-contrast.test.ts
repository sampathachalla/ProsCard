import { afterEach, describe, expect, it } from 'vitest';
import { extractPaletteFromBuffer } from '../../media/services/palette-extractor.service.js';

const originalLlmApi = process.env.LLM_API;

afterEach(() => {
  process.env.LLM_API = originalLlmApi;
});

describe('logo palette contrast', () => {
  it('protects a narrow dark wordmark with a light logo background', async () => {
    process.env.LLM_API = '';
    const svg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="90" height="100" fill="#168cff"/>
        <rect x="90" width="1" height="100" fill="#101820"/>
      </svg>
    `);

    const palette = await extractPaletteFromBuffer(svg);

    expect(palette.hasDarkElements).toBe(true);
    expect(palette.logoBackground).toBe('#ffffff');
    expect(palette.tagThemes.Business.surfaceColor).toBe('#ffffff');
    expect(palette.tagThemes.Business.backgroundColor).not.toBe('');
  });
});
