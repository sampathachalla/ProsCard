// components/scannerComponents/Hooks/useCardReader.ts
import { useCallback, useRef, useState } from 'react';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { ApiError } from '@/services/api/client';
import { readCardPhoto } from '../Services/cardReaderService';
import type { CapturedCard, CardReading, ProcessedCard } from '../types/scanner.types';

export type CardReadStatus = 'idle' | 'reading' | 'done' | 'notACard' | 'failed' | 'unavailable';

/** Outcome of one read; `stale` means a newer read started, so this result must be ignored. */
export type CardReadResult =
  | { status: 'done'; card: ProcessedCard; reading: CardReading }
  | { status: 'notACard'; reading: CardReading }
  | { status: 'failed' | 'unavailable'; error: string }
  | { status: 'stale' };

/**
 * Reads a card photo with the backend card reader. Only the latest request wins, so rescanning
 * while a read is in flight never applies stale results.
 */
export function useCardReader() {
  const [status, setStatus] = useState<CardReadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const read = useCallback(async (card: CapturedCard): Promise<CardReadResult> => {
    const request = ++latest.current;
    setError(null);
    if (AUTH_TEST_MODE) {
      setStatus('unavailable');
      return { status: 'unavailable', error: 'Card reading needs the backend.' };
    }
    setStatus('reading');
    try {
      const result = await readCardPhoto(card);
      if (request !== latest.current) return { status: 'stale' };
      if (!result.reading.isBusinessCard) {
        setStatus('notACard');
        return { status: 'notACard', reading: result.reading };
      }
      setStatus('done');
      return { status: 'done', ...result };
    } catch (reason) {
      if (request !== latest.current) return { status: 'stale' };
      const outcome = reason instanceof ApiError && reason.status === 503 ? 'unavailable' : 'failed';
      const message = reason instanceof Error ? reason.message : 'Could not read the card.';
      setStatus(outcome);
      setError(message);
      return { status: outcome, error: message };
    }
  }, []);

  const reset = useCallback(() => {
    latest.current++;
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, read, reset };
}
