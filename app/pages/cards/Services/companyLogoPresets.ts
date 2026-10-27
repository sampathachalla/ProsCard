import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SimpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import { apiRequest } from '@/services/api/client';

export const COMPANY_LOGO_PRESET_PREFIX = 'proscard-logo:';
const COMMUNITY_LOGOS_STORAGE_KEY = 'proscard:community-company-logos-v1';

export type CompanyLogoPreset = {
  id: string;
  label: string;
  keywords: string[];
  value: string;
  source: number | { uri: string };
  brandColor?: string;
};

export type CommunityCompanyLogoItem = {
  id: string;
  name: string;
  value: string;
  isOwn?: boolean;
  createdAt?: string;
};

function isSimpleIcon(value: unknown): value is SimpleIcon {
  if (!value || typeof value !== 'object') return false;
  const icon = value as Partial<SimpleIcon>;
  return Boolean(icon.title && icon.slug && icon.hex && icon.path);
}

function iconDataUri(icon: SimpleIcon): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${icon.hex}" d="${icon.path}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * The complete local Simple Icons catalog. It is searchable offline and adds no API keys,
 * network requests, attribution service, or user tracking to the logo picker.
 */
export const COMPANY_LOGO_PRESETS: CompanyLogoPreset[] = Object.values(SimpleIcons)
  .filter(isSimpleIcon)
  .map((icon) => ({
    id: icon.slug,
    label: icon.title,
    keywords: [icon.slug, icon.title],
    value: `${COMPANY_LOGO_PRESET_PREFIX}${icon.slug}`,
    source: { uri: iconDataUri(icon) },
    brandColor: `#${icon.hex}`,
  }))
  .sort((left, right) => left.label.localeCompare(right.label));

const POPULAR_SIMPLE_ICON_SLUGS = [
  'google', 'apple', 'meta', 'nvidia', 'netflix', 'tesla', 'stripe', 'shopify',
  'spotify', 'uber', 'airbnb', 'github', 'atlassian', 'accenture', 'goldmansachs',
  'cisco', 'intel', 'samsung', 'anthropic', 'amd', 'cloudflare', 'dropbox', 'zoom',
  'paypal', 'visa', 'mastercard', 'databricks', 'snowflake', 'hubspot', 'tcs', 'wipro',
];

/** Read-only compatibility for cards saved before the Simple Icons migration. */
const LEGACY_COMPANY_LOGO_PRESETS: Omit<CompanyLogoPreset, 'source'>[] = [
  ['microsoft', 'Microsoft'], ['amazon', 'Amazon'], ['openai', 'OpenAI'], ['ibm', 'IBM'],
  ['oracle', 'Oracle'], ['salesforce', 'Salesforce'], ['adobe', 'Adobe'], ['slack', 'Slack'],
  ['deloitte', 'Deloitte'], ['jpmorgan', 'J.P. Morgan'], ['mindpros', 'MindPros'],
].map(([id, label]) => ({
  id,
  label,
  keywords: [id, label],
  value: `${COMPANY_LOGO_PRESET_PREFIX}${id}`,
}));

function legacyLogoSource(id: string): number {
  switch (id) {
    case 'microsoft': return require('../../../assets/company-logos/microsoft.png');
    case 'amazon': return require('../../../assets/company-logos/amazon.png');
    case 'openai': return require('../../../assets/company-logos/openai.png');
    case 'ibm': return require('../../../assets/company-logos/ibm.png');
    case 'oracle': return require('../../../assets/company-logos/oracle.png');
    case 'salesforce': return require('../../../assets/company-logos/salesforce.png');
    case 'adobe': return require('../../../assets/company-logos/adobe.png');
    case 'slack': return require('../../../assets/company-logos/slack.png');
    case 'deloitte': return require('../../../assets/company-logos/deloitte.png');
    case 'jpmorgan': return require('../../../assets/company-logos/jpmorgan.png');
    case 'mindpros': return require('../../../assets/company-logos/mindpros.png');
    default: return require('../../../assets/vcpros-logo-v3-dark.png');
  }
}

export function isCompanyLogoPreset(value: string): boolean {
  return Boolean(value && value.startsWith(COMPANY_LOGO_PRESET_PREFIX));
}

export function resolveCompanyLogoPreset(value: string): CompanyLogoPreset | undefined {
  if (!isCompanyLogoPreset(value)) return undefined;
  const current = COMPANY_LOGO_PRESETS.find((item) => item.value === value);
  if (current) return current;
  const legacy = LEGACY_COMPANY_LOGO_PRESETS.find((item) => item.value === value);
  return legacy ? { ...legacy, source: legacyLogoSource(legacy.id) } : undefined;
}

export function filterCompanyLogoPresets(
  query: string,
): CompanyLogoPreset[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    const popularOrder = new Map(POPULAR_SIMPLE_ICON_SLUGS.map((slug, index) => [slug, index]));
    return COMPANY_LOGO_PRESETS
      .filter((preset) => popularOrder.has(preset.id))
      .sort((left, right) => (popularOrder.get(left.id) ?? 0) - (popularOrder.get(right.id) ?? 0));
  }
  const matches = COMPANY_LOGO_PRESETS.filter((preset) => {
    return (
      preset.label.toLowerCase().includes(cleanQuery) ||
      preset.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))
    );
  });
  return matches.slice(0, 60);
}

async function readLocalCommunityLogos(): Promise<CommunityCompanyLogoItem[]> {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_LOGOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((candidate): CommunityCompanyLogoItem[] => {
      if (!candidate || typeof candidate !== 'object') return [];
      const item = candidate as Partial<CommunityCompanyLogoItem>;
      if (typeof item.id !== 'string' || typeof item.value !== 'string' || !item.value.trim()) return [];
      return [{
        id: item.id,
        name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Uploaded Company Logo',
        value: item.value.trim(),
        isOwn: true,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
      }];
    });
  } catch {
    return [];
  }
}

export async function recordCommunityUploadedLogo(entry: {
  name?: string;
  value: string;
  isOwn?: boolean;
}): Promise<void> {
  const cleanValue = entry.value.trim();
  if (!cleanValue || isCompanyLogoPreset(cleanValue)) return;
  try {
    const existing = await readLocalCommunityLogos();
    const filtered = existing.filter((item) => item.value !== cleanValue);
    const nextItem: CommunityCompanyLogoItem = {
      id: `local-${Date.now()}`,
      name: entry.name?.trim() || 'Uploaded Company Logo',
      value: cleanValue,
      isOwn: entry.isOwn ?? true,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      COMMUNITY_LOGOS_STORAGE_KEY,
      JSON.stringify([nextItem, ...filtered].slice(0, 40)),
    );
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Returns public company-logo uploads from other VC Pros users. The response is treated as
 * untrusted data so a malformed legacy record can never crash the picker.
 */
export async function fetchCommunityUploadedLogos(
  query = '',
): Promise<CommunityCompanyLogoItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  const response = await apiRequest<{ items?: unknown }>(
    `/media/company-logos${cleanQuery ? `?q=${encodeURIComponent(cleanQuery)}` : ''}`,
  )
    .catch(() => ({ items: [] }));
  const candidates = Array.isArray(response.items) ? response.items : [];
  const seenValues = new Set<string>();
  const merged: CommunityCompanyLogoItem[] = [];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const item = candidate as {
      mediaId?: unknown; name?: unknown; contentUrl?: unknown; isOwn?: unknown; createdAt?: unknown;
    };
    if (item.isOwn !== false || typeof item.mediaId !== 'string' || typeof item.contentUrl !== 'string') continue;
    const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Company Logo';
    const value = item.contentUrl.trim();
    if (!value || seenValues.has(value) || (cleanQuery && !name.toLowerCase().includes(cleanQuery))) continue;
    seenValues.add(value);
    merged.push({
      id: item.mediaId,
      name,
      value,
      isOwn: false,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
    });
  }

  return merged;
}
