import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api/client';

export const COMPANY_LOGO_PRESET_PREFIX = 'proscard-logo:';
const COMMUNITY_LOGOS_STORAGE_KEY = 'proscard:community-company-logos-v1';

export type CompanyLogoCategory =
  | 'all'
  | 'big-tech'
  | 'ai-cloud'
  | 'enterprise-saas'
  | 'finance-consulting';

export type CompanyLogoPreset = {
  id: string;
  label: string;
  domain: string;
  category: Exclude<CompanyLogoCategory, 'all'>;
  keywords: string[];
  value: string;
  source: number;
};

export type CommunityCompanyLogoItem = {
  id: string;
  name: string;
  value: string;
  isOwn?: boolean;
  createdAt?: string;
};

export type GlobalCompanySearchResult = {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
};

function logoPreset(
  id: string,
  label: string,
  domain: string,
  category: Exclude<CompanyLogoCategory, 'all'>,
  keywords: string[],
  source: number,
): CompanyLogoPreset {
  return {
    id,
    label,
    domain,
    category,
    keywords,
    source,
    value: `${COMPANY_LOGO_PRESET_PREFIX}${id}`,
  };
}

export const COMPANY_LOGO_CATEGORIES: { id: CompanyLogoCategory; label: string }[] = [
  { id: 'all', label: 'All Brands' },
  { id: 'big-tech', label: 'Big Tech' },
  { id: 'ai-cloud', label: 'AI & Cloud' },
  { id: 'enterprise-saas', label: 'Enterprise & SaaS' },
  { id: 'finance-consulting', label: 'Finance & Consulting' },
];

/** Curated, high-resolution bundled logos for famous global companies. */
export const COMPANY_LOGO_PRESETS: CompanyLogoPreset[] = [
  logoPreset(
    'microsoft',
    'Microsoft',
    'microsoft.com',
    'big-tech',
    ['microsoft', 'msft', 'azure', 'windows', 'xbox', 'office'],
    require('@/assets/company-logos/microsoft.png'),
  ),
  logoPreset(
    'google',
    'Google',
    'google.com',
    'big-tech',
    ['google', 'alphabet', 'gcp', 'android', 'youtube', 'deepmind'],
    require('@/assets/company-logos/google.png'),
  ),
  logoPreset(
    'apple',
    'Apple',
    'apple.com',
    'big-tech',
    ['apple', 'ios', 'mac', 'iphone', 'cupertino'],
    require('@/assets/company-logos/apple.png'),
  ),
  logoPreset(
    'amazon',
    'Amazon',
    'amazon.com',
    'big-tech',
    ['amazon', 'aws', 'prime', 'alexa'],
    require('@/assets/company-logos/amazon.png'),
  ),
  logoPreset(
    'meta',
    'Meta',
    'meta.com',
    'big-tech',
    ['meta', 'facebook', 'instagram', 'whatsapp', 'threads'],
    require('@/assets/company-logos/meta.png'),
  ),
  logoPreset(
    'nvidia',
    'NVIDIA',
    'nvidia.com',
    'ai-cloud',
    ['nvidia', 'gpu', 'cuda', 'ai', 'geforce'],
    require('@/assets/company-logos/nvidia.png'),
  ),
  logoPreset(
    'openai',
    'OpenAI',
    'openai.com',
    'ai-cloud',
    ['openai', 'chatgpt', 'gpt', 'ai'],
    require('@/assets/company-logos/openai.png'),
  ),
  logoPreset(
    'netflix',
    'Netflix',
    'netflix.com',
    'big-tech',
    ['netflix', 'streaming', 'entertainment'],
    require('@/assets/company-logos/netflix.png'),
  ),
  logoPreset(
    'tesla',
    'Tesla',
    'tesla.com',
    'big-tech',
    ['tesla', 'ev', 'automotive', 'energy'],
    require('@/assets/company-logos/tesla.png'),
  ),
  logoPreset(
    'ibm',
    'IBM',
    'ibm.com',
    'ai-cloud',
    ['ibm', 'watson', 'red hat', 'cloud', 'consulting'],
    require('@/assets/company-logos/ibm.png'),
  ),
  logoPreset(
    'oracle',
    'Oracle',
    'oracle.com',
    'ai-cloud',
    ['oracle', 'oci', 'database', 'cloud', 'java'],
    require('@/assets/company-logos/oracle.png'),
  ),
  logoPreset(
    'salesforce',
    'Salesforce',
    'salesforce.com',
    'enterprise-saas',
    ['salesforce', 'crm', 'cloud', 'tableau', 'mulesoft'],
    require('@/assets/company-logos/salesforce.png'),
  ),
  logoPreset(
    'adobe',
    'Adobe',
    'adobe.com',
    'enterprise-saas',
    ['adobe', 'creative cloud', 'photoshop', 'acrobat'],
    require('@/assets/company-logos/adobe.png'),
  ),
  logoPreset(
    'stripe',
    'Stripe',
    'stripe.com',
    'finance-consulting',
    ['stripe', 'payments', 'fintech', 'billing'],
    require('@/assets/company-logos/stripe.png'),
  ),
  logoPreset(
    'shopify',
    'Shopify',
    'shopify.com',
    'enterprise-saas',
    ['shopify', 'ecommerce', 'commerce', 'retail'],
    require('@/assets/company-logos/shopify.png'),
  ),
  logoPreset(
    'spotify',
    'Spotify',
    'spotify.com',
    'big-tech',
    ['spotify', 'audio', 'music', 'streaming'],
    require('@/assets/company-logos/spotify.png'),
  ),
  logoPreset(
    'uber',
    'Uber',
    'uber.com',
    'big-tech',
    ['uber', 'mobility', 'uber eats', 'rides'],
    require('@/assets/company-logos/uber.png'),
  ),
  logoPreset(
    'airbnb',
    'Airbnb',
    'airbnb.com',
    'big-tech',
    ['airbnb', 'travel', 'hospitality'],
    require('@/assets/company-logos/airbnb.png'),
  ),
  logoPreset(
    'github',
    'GitHub',
    'github.com',
    'ai-cloud',
    ['github', 'git', 'copilot', 'developer', 'open source'],
    require('@/assets/company-logos/github.png'),
  ),
  logoPreset(
    'slack',
    'Slack',
    'slack.com',
    'enterprise-saas',
    ['slack', 'messaging', 'collaboration', 'workplace'],
    require('@/assets/company-logos/slack.png'),
  ),
  logoPreset(
    'atlassian',
    'Atlassian',
    'atlassian.com',
    'enterprise-saas',
    ['atlassian', 'jira', 'confluence', 'trello', 'bitbucket'],
    require('@/assets/company-logos/atlassian.png'),
  ),
  logoPreset(
    'deloitte',
    'Deloitte',
    'deloitte.com',
    'finance-consulting',
    ['deloitte', 'consulting', 'advisory', 'audit', 'big four'],
    require('@/assets/company-logos/deloitte.png'),
  ),
  logoPreset(
    'accenture',
    'Accenture',
    'accenture.com',
    'finance-consulting',
    ['accenture', 'consulting', 'strategy', 'digital'],
    require('@/assets/company-logos/accenture.png'),
  ),
  logoPreset(
    'jpmorgan',
    'J.P. Morgan',
    'jpmorgan.com',
    'finance-consulting',
    ['jpmorgan', 'jp morgan', 'chase', 'banking', 'finance'],
    require('@/assets/company-logos/jpmorgan.png'),
  ),
  logoPreset(
    'goldmansachs',
    'Goldman Sachs',
    'goldmansachs.com',
    'finance-consulting',
    ['goldman sachs', 'gs', 'investment banking', 'finance'],
    require('@/assets/company-logos/goldmansachs.png'),
  ),
  logoPreset(
    'cisco',
    'Cisco',
    'cisco.com',
    'ai-cloud',
    ['cisco', 'networking', 'webex', 'security', 'cloud'],
    require('@/assets/company-logos/cisco.png'),
  ),
  logoPreset(
    'intel',
    'Intel',
    'intel.com',
    'big-tech',
    ['intel', 'semiconductor', 'processors', 'chips'],
    require('@/assets/company-logos/intel.png'),
  ),
  logoPreset(
    'samsung',
    'Samsung',
    'samsung.com',
    'big-tech',
    ['samsung', 'galaxy', 'electronics', 'mobile'],
    require('@/assets/company-logos/samsung.png'),
  ),
  logoPreset(
    'mindpros',
    'MindPros',
    'mindpros.com',
    'enterprise-saas',
    ['mindpros', 'vcpros', 'proscard', 'consulting', 'technology'],
    require('@/assets/company-logos/mindpros.png'),
  ),
  logoPreset(
    'vcpros',
    'VC Pros',
    'vcpros.app',
    'enterprise-saas',
    ['vcpros', 'vc pros', 'proscard', 'digital card'],
    require('@/assets/vcpros-logo-v3-dark.png'),
  ),
];

export function isCompanyLogoPreset(value: string): boolean {
  return Boolean(value && value.startsWith(COMPANY_LOGO_PRESET_PREFIX));
}

export function resolveCompanyLogoPreset(value: string): CompanyLogoPreset | undefined {
  if (!isCompanyLogoPreset(value)) return undefined;
  return COMPANY_LOGO_PRESETS.find((item) => item.value === value);
}

export function filterCompanyLogoPresets(
  query: string,
  category: CompanyLogoCategory = 'all',
): CompanyLogoPreset[] {
  const cleanQuery = query.trim().toLowerCase();
  return COMPANY_LOGO_PRESETS.filter((preset) => {
    if (category !== 'all' && preset.category !== category) {
      return false;
    }
    if (!cleanQuery) return true;
    return (
      preset.label.toLowerCase().includes(cleanQuery) ||
      preset.domain.toLowerCase().includes(cleanQuery) ||
      preset.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))
    );
  });
}

/**
 * Searches global companies via Clearbit's public company autocomplete API
 * so users can find and select logos for any company worldwide.
 */
export async function searchGlobalCompanyLogos(
  query: string,
  signal?: AbortSignal,
): Promise<GlobalCompanySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  try {
    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(trimmed)}`,
      { signal },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as Array<{
      name?: string;
      domain?: string;
      logo?: string;
    }>;
    if (!Array.isArray(data)) return [];
    const presetDomains = new Set(COMPANY_LOGO_PRESETS.map((p) => p.domain.toLowerCase()));
    return data
      .filter(
        (item): item is { name: string; domain: string; logo: string } =>
          Boolean(
            item &&
              typeof item.name === 'string' &&
              typeof item.domain === 'string' &&
              typeof item.logo === 'string' &&
              item.logo.startsWith('https://') &&
              !presetDomains.has(item.domain.toLowerCase()),
          ),
      )
      .slice(0, 12)
      .map((item) => ({
        id: `global-${item.domain}`,
        name: item.name,
        domain: item.domain,
        logoUrl: item.logo,
      }));
  } catch {
    return [];
  }
}

async function readLocalCommunityLogos(): Promise<CommunityCompanyLogoItem[]> {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_LOGOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
 * Fetches company logos uploaded by users across the platform (backend `/media/company-logos`)
 * combined with locally cached user uploads.
 */
export async function fetchCommunityUploadedLogos(
  query = '',
): Promise<CommunityCompanyLogoItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  const [localItems, remoteItems] = await Promise.all([
    readLocalCommunityLogos(),
    apiRequest<{
      items?: Array<{
        mediaId: string;
        name: string;
        contentUrl: string;
        isOwn?: boolean;
        createdAt?: string;
      }>;
    }>(`/media/company-logos${cleanQuery ? `?q=${encodeURIComponent(cleanQuery)}` : ''}`)
      .then((res) =>
        (res.items ?? []).map((item) => ({
          id: item.mediaId,
          name: item.name || 'Company Logo',
          value: item.contentUrl,
          isOwn: item.isOwn,
          createdAt: item.createdAt,
        })),
      )
      .catch(() => [] as CommunityCompanyLogoItem[]),
  ]);

  const seenValues = new Set<string>();
  const merged: CommunityCompanyLogoItem[] = [];

  for (const item of [...remoteItems, ...localItems]) {
    if (!item.value || seenValues.has(item.value)) continue;
    if (cleanQuery && !item.name.toLowerCase().includes(cleanQuery)) continue;
    seenValues.add(item.value);
    merged.push(item);
  }

  return merged;
}
