import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';
import { MediaRepository } from '../../media/repository/media.repository.js';
import type { ExtractedLogoPalette } from '../../media/services/palette-extractor.service.js';

const contentHash = 'a'.repeat(64);
const sourceKey = `url:${'b'.repeat(64)}`;
const pool = createPool(loadConfig());
const repo = new MediaRepository(pool);

const palette: ExtractedLogoPalette = {
  dominant: '#168cff', secondary: '#0866c6', accent: '#48a8ff',
  hasDarkElements: true, hasLightElements: false,
  suggestedGradient: ['#0866c6', '#168cff'], suggestedSurface: '#ffffff',
  logoBackground: '#ffffff', isDarkRecommended: false,
  tagThemes: {} as ExtractedLogoPalette['tagThemes'], paletteSource: 'deterministic',
};

beforeAll(async () => {
  await pool.query('DELETE FROM logo_theme_cache WHERE content_hash=$1', [contentHash]);
});

afterAll(async () => {
  await pool.query('DELETE FROM logo_theme_cache WHERE content_hash=$1', [contentHash]);
  await pool.end();
});

describe('shared logo theme cache', () => {
  it('reuses a stored palette by content hash and URL alias', async () => {
    await repo.saveLogoTheme(contentHash, palette, sourceKey);

    expect((await repo.findLogoThemeByContentHash(contentHash))?.dominant).toBe('#168cff');
    expect((await repo.findLogoThemeBySourceKey(sourceKey))?.logoBackground).toBe('#ffffff');

    const row = await pool.query<{ hit_count: string }>(
      'SELECT hit_count::text FROM logo_theme_cache WHERE content_hash=$1',
      [contentHash],
    );
    expect(Number(row.rows[0]?.hit_count)).toBe(2);
  });
});
