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

/** Full-color bundled wordmarks for popular companies; every require must stay static for Metro. */
function curatedLogoSource(id: string): number | undefined {
  // Vitest does not transform React Native image modules; production Metro resolves these requires.
  if (process.env.VITEST) return undefined;
  switch (id) {
    case 'accenture': return require('../../../assets/company-logos/accenture.png');
    case 'adobe': return require('../../../assets/company-logos/adobe.png');
    case 'airbnb': return require('../../../assets/company-logos/airbnb.png');
    case 'amazon': return require('../../../assets/company-logos/amazon.png');
    case 'apple': return require('../../../assets/company-logos/apple.png');
    case 'atlassian': return require('../../../assets/company-logos/atlassian.png');
    case 'cisco': return require('../../../assets/company-logos/cisco.png');
    case 'deloitte': return require('../../../assets/company-logos/deloitte.png');
    case 'github': return require('../../../assets/company-logos/github.png');
    case 'goldmansachs': return require('../../../assets/company-logos/goldmansachs.png');
    case 'google': return require('../../../assets/company-logos/google.png');
    case 'ibm': return require('../../../assets/company-logos/ibm.png');
    case 'intel': return require('../../../assets/company-logos/intel.png');
    case 'jpmorgan': return require('../../../assets/company-logos/jpmorgan.png');
    case 'meta': return require('../../../assets/company-logos/meta.png');
    case 'microsoft': return require('../../../assets/company-logos/microsoft.png');
    case 'mindpros': return require('../../../assets/company-logos/mindpros.png');
    case 'netflix': return require('../../../assets/company-logos/netflix.png');
    case 'nvidia': return require('../../../assets/company-logos/nvidia.png');
    case 'openai': return require('../../../assets/company-logos/openai.png');
    case 'oracle': return require('../../../assets/company-logos/oracle.png');
    case 'salesforce': return require('../../../assets/company-logos/salesforce.png');
    case 'samsung': return require('../../../assets/company-logos/samsung.png');
    case 'shopify': return require('../../../assets/company-logos/shopify.png');
    case 'slack': return require('../../../assets/company-logos/slack.png');
    case 'spotify': return require('../../../assets/company-logos/spotify.png');
    case 'stripe': return require('../../../assets/company-logos/stripe.png');
    case 'tesla': return require('../../../assets/company-logos/tesla.png');
    case 'uber': return require('../../../assets/company-logos/uber.png');
    default: return undefined;
  }
}

const CURATED_LOGO_LABELS: Record<string, string> = {
  accenture: 'Accenture', adobe: 'Adobe', airbnb: 'Airbnb', amazon: 'Amazon', apple: 'Apple',
  atlassian: 'Atlassian', cisco: 'Cisco', deloitte: 'Deloitte', github: 'GitHub',
  goldmansachs: 'Goldman Sachs', google: 'Google', ibm: 'IBM', intel: 'Intel',
  jpmorgan: 'J.P. Morgan', meta: 'Meta', microsoft: 'Microsoft', mindpros: 'MindPros',
  netflix: 'Netflix', nvidia: 'NVIDIA', openai: 'OpenAI', oracle: 'Oracle',
  salesforce: 'Salesforce', samsung: 'Samsung', shopify: 'Shopify', slack: 'Slack',
  spotify: 'Spotify', stripe: 'Stripe', tesla: 'Tesla', uber: 'Uber',
};

/**
 * Curated full-color wordmarks are preferred where available. The complete local Simple Icons
 * catalog remains the searchable offline fallback without API keys or user tracking.
 */
const simpleIconPresets: CompanyLogoPreset[] = Object.values(SimpleIcons)
  .filter(isSimpleIcon)
  .map((icon) => ({
    id: icon.slug,
    label: icon.title,
    keywords: [icon.slug, icon.title],
    value: `${COMPANY_LOGO_PRESET_PREFIX}${icon.slug}`,
    source: curatedLogoSource(icon.slug) ?? { uri: iconDataUri(icon) },
    brandColor: `#${icon.hex}`,
  }));

const simpleIconIds = new Set(simpleIconPresets.map((preset) => preset.id));
const curatedOnlyPresets: CompanyLogoPreset[] = Object.entries(CURATED_LOGO_LABELS)
  .filter(([id]) => !simpleIconIds.has(id))
  .flatMap(([id, label]) => {
    const source = curatedLogoSource(id) ?? (process.env.VITEST
      ? { uri: 'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' }
      : undefined);
    return source ? [{
      id,
      label,
      keywords: [id, label],
      value: `${COMPANY_LOGO_PRESET_PREFIX}${id}`,
      source,
    }] : [];
  });

export const COMPANY_LOGO_PRESETS: CompanyLogoPreset[] = [
  ...simpleIconPresets,
  ...curatedOnlyPresets,
].sort((left, right) => left.label.localeCompare(right.label));

const POPULAR_SIMPLE_ICON_SLUGS = [
  'google', 'apple', 'microsoft', 'meta', 'nvidia', 'netflix', 'tesla', 'stripe', 'shopify',
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

export function isCompanyLogoPreset(value: string): boolean {
  return Boolean(value && value.startsWith(COMPANY_LOGO_PRESET_PREFIX));
}

export function resolveCompanyLogoPreset(value: string): CompanyLogoPreset | undefined {
  if (!isCompanyLogoPreset(value)) return undefined;
  const current = COMPANY_LOGO_PRESETS.find((item) => item.value === value);
  if (current) return current;
  const legacy = LEGACY_COMPANY_LOGO_PRESETS.find((item) => item.value === value);
  return legacy ? {
    ...legacy,
    source: curatedLogoSource(legacy.id) ?? require('../../../assets/vcpros-logo-v3-dark.png'),
  } : undefined;
}

function normalizeCompanySearch(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function filterCompanyLogoPresets(
  query: string,
): CompanyLogoPreset[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    const popularOrder = new Map(POPULAR_SIMPLE_ICON_SLUGS.map((slug, index) => [slug, index]));
    return COMPANY_LOGO_PRESETS
      .filter((preset) => popularOrder.has(preset.id))
      .sort((left, right) => (popularOrder.get(left.id) ?? 0) - (popularOrder.get(right.id) ?? 0))
      .slice(0, 4);
  }
  const normalizedQuery = normalizeCompanySearch(cleanQuery);
  const popularOrder = new Map(POPULAR_SIMPLE_ICON_SLUGS.map((slug, index) => [slug, index]));
  const matches = COMPANY_LOGO_PRESETS.filter((preset) =>
      preset.label.toLowerCase().includes(cleanQuery) ||
      (Boolean(normalizedQuery) && normalizeCompanySearch(preset.label).includes(normalizedQuery)) ||
      preset.keywords.some((kw) =>
        kw.toLowerCase().includes(cleanQuery) ||
        (Boolean(normalizedQuery) && normalizeCompanySearch(kw).includes(normalizedQuery))
      )
  );
  return matches
    .sort((left, right) => {
      const leftLabel = normalizeCompanySearch(left.label);
      const rightLabel = normalizeCompanySearch(right.label);
      const leftPrefix = leftLabel.startsWith(normalizedQuery) ? 0 : 1;
      const rightPrefix = rightLabel.startsWith(normalizedQuery) ? 0 : 1;
      if (leftPrefix !== rightPrefix) return leftPrefix - rightPrefix;
      const leftPopularity = popularOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightPopularity = popularOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      if (leftPopularity !== rightPopularity) return leftPopularity - rightPopularity;
      return left.label.localeCompare(right.label);
    })
    .slice(0, 4);
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
    if (typeof item.mediaId !== 'string' || typeof item.contentUrl !== 'string') continue;
    const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Company Logo';
    const value = item.contentUrl.trim();
    if (
      !value ||
      seenValues.has(value) ||
      (cleanQuery && !normalizeCompanySearch(name).includes(normalizeCompanySearch(cleanQuery)))
    ) continue;
    seenValues.add(value);
    merged.push({
      id: item.mediaId,
      name,
      value,
      isOwn: item.isOwn === true,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
    });
  }

  return merged;
}
