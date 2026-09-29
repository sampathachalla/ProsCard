const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');

export const API_BASE_URL = configuredUrl ?? '';
export const API_V1_URL = API_BASE_URL.endsWith('/api/v1')
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1`;

export function requireApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL must point to the ProsCard backend.');
  }
  return API_V1_URL;
}
