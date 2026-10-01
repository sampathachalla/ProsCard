// components/scannerComponents/Services/scanHandoff.ts
import type { CardReading, ProcessedCard } from '../types/scanner.types';

/** A processed scan waiting to be reviewed; `reading` is null when the card could not be read. */
export type ScanResult = { card: ProcessedCard; reading: CardReading | null };

const results = new Map<string, ScanResult>();

/**
 * Hands a processed scan from the scanner to the review screen. Photos and readings are too
 * large for route params, so the route only carries the returned id.
 */
export function saveScanResult(result: ScanResult): string {
  const id = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  results.set(id, result);
  return id;
}

export function getScanResult(id: string | undefined): ScanResult | null {
  return id ? results.get(id) ?? null : null;
}

export function clearScanResult(id: string | undefined): void {
  if (id) results.delete(id);
}
