import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const MAX_REDIRECTS = 3;

/**
 * Logo CDNs such as Brandfetch serve their HTML website to non-browser agents; these headers ask for the
 * image itself.
 */
export const BROWSER_IMAGE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  Accept: 'image/webp,image/png,image/svg+xml,image/*',
};

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 8000;

/** Loopback, private, link-local (cloud metadata), CGNAT, multicast and reserved ranges. */
const blocked = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 3],
] as const) blocked.addSubnet(network, prefix, 'ipv4');
for (const [network, prefix] of [
  ['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
] as const) blocked.addSubnet(network, prefix, 'ipv6');

export function isPublicAddress(address: string) {
  const family = isIP(address);
  if (family === 0) return false;
  // IPv4-mapped IPv6 (::ffff:10.0.0.1) must be judged as the IPv4 address it carries.
  const mapped = family === 6 ? address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1] : undefined;
  if (mapped) return !blocked.check(mapped, 'ipv4');
  return !blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

async function assertPublicHttpsUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('Only https image URLs are allowed.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || !addresses.every(({ address }) => isPublicAddress(address))) {
    throw new Error('Image URL does not resolve to a public address.');
  }
  return url;
}

/**
 * Fetches a user-supplied image URL from the server without letting it reach internal addresses:
 * https only, every redirect hop re-checked, a size cap and a timeout. Returns null when the response
 * is not an image or is too large.
 */
export async function fetchPublicImage(
  raw: string,
  init: { headers?: Record<string, string>; maxBytes?: number; timeoutMs?: number } = {},
): Promise<Buffer | null> {
  const maxBytes = init.maxBytes ?? DEFAULT_MAX_BYTES;
  const signal = AbortSignal.timeout(init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let url = await assertPublicHttpsUrl(raw);
  for (let hop = 0; ; hop++) {
    const response = await fetch(url, { headers: init.headers, redirect: 'manual', signal });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      if (hop >= MAX_REDIRECTS) throw new Error('Image URL redirected too many times.');
      url = await assertPublicHttpsUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      await response.body?.cancel();
      return null;
    }
    if (Number(response.headers.get('content-length') ?? 0) > maxBytes) {
      await response.body?.cancel();
      return null;
    }
    return readCapped(response, maxBytes);
  }
}

async function readCapped(response: Response, maxBytes: number) {
  if (!response.body) return null;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.byteLength;
    if (total > maxBytes) {
      await response.body.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
