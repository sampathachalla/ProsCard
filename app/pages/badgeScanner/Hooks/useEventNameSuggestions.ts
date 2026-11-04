import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listContacts } from '@/pages/contacts/Services/contactsService';
import { loadHiddenEventNames, loadRecentEventNames, mergeEventNameSuggestions } from '@/pages/contacts/Services/eventNamesService';
import { queryKeys } from '@/services/api/queryClient';

/** The user's previous events: recently chosen first, then events already on saved contacts. */
export function useEventNameSuggestions() {
  const { data: contacts } = useQuery({ queryKey: queryKeys.contacts, queryFn: listContacts });
  const [recent, setRecent] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([loadRecentEventNames(), loadHiddenEventNames()]).then(([names, hiddenNames]) => {
      if (!cancelled) { setRecent(names); setHidden(hiddenNames); }
    });
    return () => { cancelled = true; };
  }, []);

  const suggestions = useMemo(() => mergeEventNameSuggestions(contacts ?? [], recent, hidden), [contacts, hidden, recent]);
  const refresh = async () => {
    const [names, hiddenNames] = await Promise.all([loadRecentEventNames(), loadHiddenEventNames()]);
    setRecent(names); setHidden(hiddenNames);
  };
  return { suggestions, refresh };
}
