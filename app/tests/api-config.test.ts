import { describe, expect, it } from 'vitest';
import { resolveBackendConfig } from '@/services/api/config';

describe('backend API configuration', () => {
  const env = {
    EXPO_PUBLIC_LOCAL_API_URL: 'http://192.168.1.20:8050/',
    EXPO_PUBLIC_TUNNEL_API_URL: 'https://api-tunnel.example/api/v1',
    EXPO_PUBLIC_OCI_API_URL: 'https://api.example.com',
  };

  it.each([
    ['local', 'http://192.168.1.20:8050'],
    ['tunnel', 'https://api-tunnel.example'],
    ['oci', 'https://api.example.com'],
  ] as const)('selects the %s backend centrally', (target, expected) => {
    const result = resolveBackendConfig(target, env);
    expect(result.baseUrl).toBe(expected);
    expect(result.apiV1Url).toBe(`${expected}/api/v1`);
  });

  it('keeps the legacy local URL fallback without affecting other targets', () => {
    const result = resolveBackendConfig('local', { EXPO_PUBLIC_API_URL: 'http://127.0.0.1:8050' });
    expect(result.baseUrl).toBe('http://127.0.0.1:8050');
    expect(result.variable).toBe('EXPO_PUBLIC_LOCAL_API_URL');
  });
});
