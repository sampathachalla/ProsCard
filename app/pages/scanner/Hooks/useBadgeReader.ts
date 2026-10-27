import { useCallback, useRef, useState } from 'react';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import { ApiError } from '@/services/api/client';
import { readBadgePhoto } from '../Services/badgeReaderService';
import type { BadgeReading } from '../types/badge.types';
import type { CapturedCard, ProcessedCard } from '../types/scanner.types';

export type BadgeReadStatus = 'idle' | 'reading' | 'done' | 'notABadge' | 'failed' | 'unavailable';

export type BadgeReadResult =
  | { status: 'done'; card: ProcessedCard; reading: BadgeReading }
  | { status: 'notABadge'; reading: BadgeReading }
  | { status: 'failed' | 'unavailable'; error: string }
  | { status: 'stale' };

export function useBadgeReader() {
  const [status, setStatus] = useState<BadgeReadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const read = useCallback(async (card: CapturedCard): Promise<BadgeReadResult> => {
    const request = ++latest.current;
    setError(null);
    if (AUTH_TEST_MODE) {
      setStatus('unavailable');
      return { status: 'unavailable', error: 'Badge reading needs the backend.' };
    }
    setStatus('reading');
    try {
      const result = await readBadgePhoto(card);
      if (request !== latest.current) return { status: 'stale' };
      if (!result.reading.isEventBadge) {
        setStatus('notABadge');
        return { status: 'notABadge', reading: result.reading };
      }
      setStatus('done');
      return { status: 'done', ...result };
    } catch (reason) {
      if (request !== latest.current) return { status: 'stale' };
      const outcome = reason instanceof ApiError && reason.status === 503 ? 'unavailable' : 'failed';
      const message = reason instanceof Error ? reason.message : 'Could not read the badge.';
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
