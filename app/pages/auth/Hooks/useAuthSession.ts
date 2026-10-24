import { useEffect, useState } from 'react';
import { getSession, subscribeSession } from '@/services/api/session';
import type { AuthSession } from '@/services/api/types';

export function useAuthSession() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession().then((stored) => {
      if (mounted) {
        setSessionState(stored);
        setIsHydrating(false);
      }
    });
    const unsubscribe = subscribeSession((next) => {
      if (mounted) setSessionState(next);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAuthenticated: Boolean(session?.token), isHydrating };
}
