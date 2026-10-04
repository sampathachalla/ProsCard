/**
 * Parses JSON saved on the device. Storage can hold a value cut off by an app kill or written by an
 * older build, so a malformed value is treated as missing instead of throwing.
 */
export function parseStoredJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
