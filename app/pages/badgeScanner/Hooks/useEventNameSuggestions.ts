import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listContacts } from '@/pages/contacts/Services/contactsService';
import { loadRecentEventNames, mergeEventNameSuggestions } from '@/pages/contacts/Services/eventNamesService';
import { queryKeys } from '@/services/api/queryClient';

/** The user's previous events: recently chosen first, then events already on saved contacts. */
export function useEventNameSuggestions() {
  const { data: contacts } = useQuery({ queryKey: queryKeys.contacts, queryFn: listContacts });
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void loadRecentEventNames().then((names) => {
      if (!cancelled) setRecent(names);
    });
    return () => { cancelled = true; };
  }, []);

  return useMemo(() => mergeEventNameSuggestions(contacts ?? [], recent), [contacts, recent]);
}
