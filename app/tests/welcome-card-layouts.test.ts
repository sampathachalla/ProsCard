import { describe, expect, it } from 'vitest';
import {
  IDENTITY_LAYOUT_IDS,
  IDENTITY_LAYOUT_STYLES,
  PROFESSIONAL_LAYOUT_IDS,
  PROFESSIONAL_LAYOUT_STYLES,
  CONNECTION_LAYOUT_IDS,
  resolveIdentityLayoutId,
  resolveIdentityTemplateId,
  resolveProfessionalLayoutId,
  resolveConnectionsLayoutId,
  resolveLayoutStyle,
  getTemplatePaletteTier,
} from '@/pages/cards/types/card.types';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

describe('Welcome Page Styled Card Layouts', () => {
  it('has exactly 8 layouts per section (4 original + 4 new Welcome-styled)', () => {
    expect(IDENTITY_LAYOUT_IDS).toHaveLength(8);
    expect(PROFESSIONAL_LAYOUT_IDS).toHaveLength(8);
    expect(CONNECTION_LAYOUT_IDS).toHaveLength(8);
  });

  it('correctly maps new identity layouts to Welcome style templates', () => {
    expect(IDENTITY_LAYOUT_STYLES['layout-1-new']).toBe('classic-new');
    expect(IDENTITY_LAYOUT_STYLES['layout-2-new']).toBe('minimal-new');
    expect(IDENTITY_LAYOUT_STYLES['layout-5-new']).toBe('spotlight-new');
    expect(IDENTITY_LAYOUT_STYLES['layout-6-new']).toBe('editorial-new');

    expect(resolveIdentityLayoutId('layout-1-new')).toBe('layout-1-new');
    expect(resolveIdentityTemplateId('layout-1-new')).toBe('classic-new');
    expect(resolveLayoutStyle('layout-1-new', 'identity')).toBe('classic-new');
  });

  it('correctly maps new professional layouts to Welcome style templates', () => {
    expect(PROFESSIONAL_LAYOUT_STYLES['layout-1-new']).toBe('classic-new');
    expect(PROFESSIONAL_LAYOUT_STYLES['layout-3-new']).toBe('spotlight-new');
    expect(PROFESSIONAL_LAYOUT_STYLES['layout-4-new']).toBe('banner-new');
    expect(PROFESSIONAL_LAYOUT_STYLES['layout-5-new']).toBe('badge-new');

    expect(resolveProfessionalLayoutId('layout-1-new')).toBe('layout-1-new');
    expect(resolveLayoutStyle('layout-1-new', 'professional')).toBe('classic-new');
    expect(resolveLayoutStyle('layout-5-new', 'professional')).toBe('badge-new');
  });

  it('correctly maps new connection layouts', () => {
    expect(CONNECTION_LAYOUT_IDS).toContain('classic-new');
    expect(CONNECTION_LAYOUT_IDS).toContain('banner-new');
    expect(CONNECTION_LAYOUT_IDS).toContain('editorial-new');
    expect(CONNECTION_LAYOUT_IDS).toContain('compact-new');

    expect(resolveConnectionsLayoutId('classic-new')).toBe('classic-new');
    expect(resolveLayoutStyle('compact-new', 'connections')).toBe('compact-new');
  });

  it('assigns correct palette tiers to all new templates', () => {
    expect(getTemplatePaletteTier('classic-new')).toBe(3);
    expect(getTemplatePaletteTier('minimal-new')).toBe(2);
    expect(getTemplatePaletteTier('compact-new')).toBe(2);
    expect(getTemplatePaletteTier('editorial-new')).toBe(3);
    expect(getTemplatePaletteTier('spotlight-new')).toBe(3);
    expect(getTemplatePaletteTier('banner-new')).toBe(4);
    expect(getTemplatePaletteTier('badge-new')).toBe(4);
  });

  it('resolves Welcome Page signature color slots for new layouts', () => {
    const slots = resolveLayoutColorSlots({
      templateId: 'classic-new',
      theme: {
        id: 'midnight',
        accentColor: '#2563eb',
        backgroundColor: '#ffffff',
        fontStyle: 'modern',
        gradient: ['#ffffff', '#f1f5f9'],
        surfaceColor: '#f8fafc',
        textColor: '#0f172a',
        mutedTextColor: '#64748b',
      },
    });

    expect(slots.background).toBe('#070d1e');
    expect(slots.surface).toBe('#0a1128');
    expect(slots.accent).toBe('#38bdf8');
    expect(slots.highlight).toBe('#2563eb');
    expect(slots.borderColor).toBe('rgba(56, 189, 248, 0.25)');
    expect(slots.isDark).toBe(true);
  });
});

describe('contact list layout', () => {
  it('defaults new cards to the Direct Contact List every card tag uses', async () => {
    const { DEFAULT_CARD_SECTION_LAYOUTS } = await import('@/pages/cards/types/card.types');
    expect(DEFAULT_CARD_SECTION_LAYOUTS.connections).toBe('compact');
  });

  it('moves cards off the retired Action Tiles default, keeping other saved layouts', async () => {
    const { upgradeConnectionsLayoutId } = await import('@/pages/cards/types/card.types');
    expect(upgradeConnectionsLayoutId('classic')).toBe('compact');
    expect(upgradeConnectionsLayoutId(undefined)).toBe('compact');
    expect(upgradeConnectionsLayoutId('not-a-layout')).toBe('compact');
    expect(upgradeConnectionsLayoutId('compact')).toBe('compact');
    expect(upgradeConnectionsLayoutId('classic-new')).toBe('classic-new');
    expect(upgradeConnectionsLayoutId('editorial')).toBe('editorial');
  });
});
