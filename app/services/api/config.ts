/**
 * Backend switch — flip this one value to choose which API the app talks to.
 *   false → local backend (Docker on your machine)
 *   true  → backend deployed on the OCI instance
 */
export const USE_OCI_BACKEND = false;

function normalize(url: string | undefined): string {
  return url?.trim().replace(/\/$/, '') ?? '';
}

// URLs live in app/.env so machine-specific IPs stay out of git.
// EXPO_PUBLIC_API_URL is still honored as the local URL for older .env files.
const LOCAL_API_URL = normalize(process.env.EXPO_PUBLIC_LOCAL_API_URL || process.env.EXPO_PUBLIC_API_URL);
const OCI_API_URL = normalize(process.env.EXPO_PUBLIC_OCI_API_URL);

const configuredUrl = USE_OCI_BACKEND ? OCI_API_URL : LOCAL_API_URL;
const configuredVariable = USE_OCI_BACKEND ? 'EXPO_PUBLIC_OCI_API_URL' : 'EXPO_PUBLIC_LOCAL_API_URL';

/** Server origin without the version suffix, e.g. http://192.168.1.10:8050 */
export const API_BASE_URL = configuredUrl.replace(/\/api\/v1$/, '');
export const API_V1_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : '';

export function requireApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(`${configuredVariable} must point to the ProsCard backend (USE_OCI_BACKEND=${USE_OCI_BACKEND}).`);
  }
  return API_V1_URL;
}
