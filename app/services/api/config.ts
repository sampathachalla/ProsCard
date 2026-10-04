export type BackendTarget = 'local' | 'tunnel' | 'oci';

/**
 * Backend switch — change only this value, then restart Expo with a cleared cache.
 *   local  → Docker backend reachable on the current network
 *   tunnel → local Docker backend exposed through a public HTTPS tunnel
 *   oci    → backend deployed on the OCI instance (deploy/oci, https://150.136.12.178.nip.io)
 */
export const BACKEND_TARGET: BackendTarget = 'local';

function normalize(url: string | undefined): string {
  return url?.trim().replace(/\/$/, '') ?? '';
}

type BackendEnvironment = {
  EXPO_PUBLIC_LOCAL_API_URL?: string;
  EXPO_PUBLIC_TUNNEL_API_URL?: string;
  EXPO_PUBLIC_OCI_API_URL?: string;
  EXPO_PUBLIC_API_URL?: string;
};

const VARIABLE_BY_TARGET: Record<BackendTarget, keyof BackendEnvironment> = {
  local: 'EXPO_PUBLIC_LOCAL_API_URL',
  tunnel: 'EXPO_PUBLIC_TUNNEL_API_URL',
  oci: 'EXPO_PUBLIC_OCI_API_URL',
};

export function resolveBackendConfig(target: BackendTarget, env: BackendEnvironment) {
  const variable = VARIABLE_BY_TARGET[target];
  // Preserve support for older local .env files that only define EXPO_PUBLIC_API_URL.
  const rawUrl = target === 'local'
    ? env.EXPO_PUBLIC_LOCAL_API_URL || env.EXPO_PUBLIC_API_URL
    : env[variable];
  const baseUrl = normalize(rawUrl).replace(/\/api\/v1$/, '');
  return { target, variable, baseUrl, apiV1Url: baseUrl ? `${baseUrl}/api/v1` : '' };
}

const backend = resolveBackendConfig(BACKEND_TARGET, {
  EXPO_PUBLIC_LOCAL_API_URL: process.env.EXPO_PUBLIC_LOCAL_API_URL,
  EXPO_PUBLIC_TUNNEL_API_URL: process.env.EXPO_PUBLIC_TUNNEL_API_URL,
  EXPO_PUBLIC_OCI_API_URL: process.env.EXPO_PUBLIC_OCI_API_URL,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

/** Server origin without the version suffix, e.g. http://192.168.1.10:8050 */
export const API_BASE_URL = backend.baseUrl;
export const API_V1_URL = backend.apiV1Url;

export function requireApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(`${backend.variable} must point to the ProsCard backend (BACKEND_TARGET=${BACKEND_TARGET}).`);
  }
  return API_V1_URL;
}
