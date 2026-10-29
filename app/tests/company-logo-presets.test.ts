import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMPANY_LOGO_PRESET_PREFIX,
  COMPANY_LOGO_PRESETS,
  filterCompanyLogoPresets,
  partitionCompanyLogoPickerResults,
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

  it('shows valid community logos, including the current user’s uploads', async () => {
    apiRequest.mockResolvedValue({
      items: [
        null,
        { mediaId: 'mine', name: 'MindPros', contentUrl: '/mine', isOwn: true },
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
        id: 'mine',
        name: 'MindPros',
        value: '/mine',
        isOwn: true,
      }),
      expect.objectContaining({
        id: 'community-logo',
        name: 'Community Company',
        value: '/api/v1/media/community-logo/content',
        isOwn: false,
      }),
    ]);
  });

  it('matches spaced searches against compact community company names', async () => {
    apiRequest.mockResolvedValue({
      items: [{ mediaId: 'mindpros', name: 'MindPros', contentUrl: '/mindpros', isOwn: false }],
    });
    await expect(fetchCommunityUploadedLogos('mind pros')).resolves.toEqual([
      expect.objectContaining({ id: 'mindpros', name: 'MindPros' }),
    ]);
  });

  it('matches Brandfetch logos with domain and source', async () => {
    apiRequest.mockResolvedValue({
      items: [
        {
          mediaId: 'bf-uber.com',
          name: 'Uber',
          domain: 'uber.com',
          contentUrl: 'https://cdn.brandfetch.io/domain/uber.com',
          isOwn: false,
          source: 'brandfetch',
        },
      ],
    });
    const result = await fetchCommunityUploadedLogos('uber');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'bf-uber.com',
      name: 'Uber',
      domain: 'uber.com',
      value: 'https://cdn.brandfetch.io/domain/uber.com',
      source: 'brandfetch',
    });
  });

  it('keeps the logo picker usable when community logos cannot load', async () => {
    apiRequest.mockRejectedValue(new Error('offline'));
    await expect(fetchCommunityUploadedLogos()).resolves.toEqual([]);
  });

  it('partitions Brandfetch and community logos so uploads are not capped by brand rows', () => {
    const brand = Array.from({ length: 6 }, (_, index) => ({
      id: `bf-${index}`,
      name: `Brand ${index}`,
      value: `https://cdn.brandfetch.io/${index}`,
      source: 'brandfetch' as const,
    }));
    const mindPros = {
      id: 'mindpros-upload',
      name: 'MindPros',
      value: '/api/v1/media/mindpros/content',
      source: 'community' as const,
      isOwn: true,
    };
    const { brandfetch, community } = partitionCompanyLogoPickerResults([...brand, mindPros]);
    expect(brandfetch).toHaveLength(6);
    expect(community).toEqual([
      expect.objectContaining({ id: 'mindpros-upload', label: 'MindPros', source: 'community' }),
    ]);
  });
});
