import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMPANY_LOGO_PRESET_PREFIX,
  COMPANY_LOGO_PRESETS,
  filterCompanyLogoPresets,
  fetchCommunityUploadedLogos,
  resolveCompanyLogoPreset,
} from '@/pages/cards/Services/companyLogoPresets';

const { getItem, apiRequest } = vi.hoisted(() => ({
  getItem: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem, setItem: vi.fn() },
}));

vi.mock('@/services/api/client', () => ({ apiRequest }));

describe('Simple Icons company-logo library', () => {
  beforeEach(() => {
    getItem.mockReset();
    apiRequest.mockReset();
  });

  it('loads the complete searchable local catalog', () => {
    expect(COMPANY_LOGO_PRESETS.length).toBeGreaterThan(3000);
    expect(COMPANY_LOGO_PRESETS.every(
      (item) => typeof item.source !== 'number' && item.source.uri.startsWith('data:image/svg+xml'),
    )).toBe(true);
  });

  it('finds brands by title or slug without a network request', () => {
    expect(filterCompanyLogoPresets('Google')[0]).toMatchObject({ id: 'google', label: 'Google' });
    expect(filterCompanyLogoPresets('goldman sachs')[0]).toMatchObject({ id: 'goldmansachs' });
    expect(filterCompanyLogoPresets('mind pros')[0]).toMatchObject({ id: 'mindpros', label: 'MindPros' });
  });

  it('resolves the persisted preset value back to its icon', () => {
    expect(resolveCompanyLogoPreset(`${COMPANY_LOGO_PRESET_PREFIX}spotify`)).toMatchObject({
      label: 'Spotify',
      brandColor: '#1ED760',
    });
  });

  it('shows four popular suggestions before the user searches', () => {
    const popular = filterCompanyLogoPresets('');
    expect(popular).toHaveLength(4);
    expect(popular.some((item) => item.id === 'google')).toBe(true);
  });

  it('limits autocomplete results and prioritizes company-name prefixes', () => {
    const matches = filterCompanyLogoPresets('m');
    expect(matches).toHaveLength(4);
    expect(matches.every((item) => item.label.toLowerCase().startsWith('m'))).toBe(true);
    expect(matches.some((item) => item.id === 'microsoft')).toBe(true);
    expect(matches.some((item) => item.id === 'meta')).toBe(true);
  });

  it('shows only valid logos uploaded by other users', async () => {
    apiRequest.mockResolvedValue({
      items: [
        null,
        { mediaId: 'mine', name: 'My Company', contentUrl: '/mine', isOwn: true },
        { mediaId: 'missing-url', name: 'Broken', isOwn: false },
        {
          mediaId: 'community-logo',
          name: 'Community Company',
          contentUrl: '/api/v1/media/community-logo/content',
          isOwn: false,
        },
      ],
    });

    await expect(fetchCommunityUploadedLogos()).resolves.toEqual([
      expect.objectContaining({
        id: 'community-logo',
        name: 'Community Company',
        value: '/api/v1/media/community-logo/content',
        isOwn: false,
      }),
    ]);
  });

  it('keeps the logo picker usable when community logos cannot load', async () => {
    apiRequest.mockRejectedValue(new Error('offline'));
    await expect(fetchCommunityUploadedLogos()).resolves.toEqual([]);
  });
});
