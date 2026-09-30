// components/scannerComponents/Hooks/useCardReader.ts
import { useCallback, useRef, useState } from 'react';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { ApiError } from '@/services/api/client';
import { readCardPhoto } from '../Services/cardReaderService';
import type { CapturedCard, CardReading, ProcessedCard } from '../types/scanner.types';

export type CardReadStatus = 'idle' | 'reading' | 'done' | 'notACard' | 'failed' | 'unavailable';

/**
 * Reads a card photo with the backend card reader. Only the latest request wins, so rescanning
 * while a read is in flight never applies stale results.
 */
export function useCardReader() {
  const [status, setStatus] = useState<CardReadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const read = useCallback(async (card: CapturedCard): Promise<{ card: ProcessedCard; reading: CardReading } | null> => {
    const request = ++latest.current;
    setError(null);
    if (AUTH_TEST_MODE) {
      setStatus('unavailable');
      return null;
    }
    setStatus('reading');
    try {
      const result = await readCardPhoto(card);
      if (request !== latest.current) return null;
      setStatus(result.reading.isBusinessCard ? 'done' : 'notACard');
      return result;
    } catch (reason) {
      if (request !== latest.current) return null;
      setStatus(reason instanceof ApiError && reason.status === 503 ? 'unavailable' : 'failed');
      setError(reason instanceof Error ? reason.message : 'Could not read the card.');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    latest.current++;
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, read, reset };
}
