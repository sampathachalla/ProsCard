import { log } from '../../src/logger.js';

export interface BrandfetchSearchResult {
  brandId: string;
  name: string;
  domain: string;
  icon: string;
  claimed?: boolean;
  verified?: boolean;
}

interface CacheEntry {
  timestamp: number;
  results: BrandfetchSearchResult[];
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class BrandfetchService {
  private cache = new Map<string, CacheEntry>();

  private get apiKey(): string | undefined {
    return process.env.BRANDFETCH_API_KEY?.trim() || undefined;
  }

  private get clientId(): string | undefined {
    return process.env.BRANDFETCH_CLIENT_ID?.trim() || undefined;
  }

  /**
   * Search for company logos using Brandfetch Search API v2.
   * If an API key or Client ID is configured, it is sent with the request.
   */
  async searchBrands(query: string): Promise<BrandfetchSearchResult[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const cached = this.cache.get(cleanQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const clientIdParam = this.clientId ? `?c=${encodeURIComponent(this.clientId)}` : '';
      const url = `https://api.brandfetch.io/v2/search/${encodeURIComponent(cleanQuery)}${clientIdParam}`;

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        log('warn', 'brandfetch_search_failed', { status: res.status });
        return [];
      }

      const data: unknown = await res.json();
      if (!Array.isArray(data)) return [];

      const results: BrandfetchSearchResult[] = [];
      const seenDomains = new Set<string>();

      for (const item of data) {
        if (!item || typeof item !== 'object') continue;
        const brand = item as {
          brandId?: unknown;
          name?: unknown;
          domain?: unknown;
          icon?: unknown;
          claimed?: unknown;
          verified?: unknown;
        };

        const domain = typeof brand.domain === 'string' ? brand.domain.trim().toLowerCase() : '';
        const name = typeof brand.name === 'string' ? brand.name.trim() : domain;
        const icon = typeof brand.icon === 'string' ? brand.icon.trim() : '';
        const brandId = typeof brand.brandId === 'string' ? brand.brandId.trim() : '';

        if (!domain && !icon) continue;
        if (domain && seenDomains.has(domain)) continue;
        if (domain) seenDomains.add(domain);

        // Fallback to Brandfetch CDN URL if icon not directly provided
        const finalIcon = icon || (brandId
          ? `https://cdn.brandfetch.io/${encodeURIComponent(brandId)}/w/128/h/128/fallback/lettermark/icon.webp${this.clientId ? `?c=${encodeURIComponent(this.clientId)}` : ''}`
          : '');
        if (!finalIcon) continue;

        results.push({
          brandId: brandId || domain,
          name: name || domain,
          domain,
          icon: finalIcon,
          claimed: brand.claimed === true,
          verified: brand.verified === true,
        });

        if (results.length >= 10) break;
      }

      this.cache.set(cleanQuery, {
        timestamp: Date.now(),
        results,
      });

      return results;
    } catch (error) {
      log('warn', 'brandfetch_search_error', {
        message: error instanceof Error ? error.message : String(error),
      });
      // Return empty results on network/timeout/error without failing the user's request
      return [];
    }
  }
}

export const brandfetchService = new BrandfetchService();
