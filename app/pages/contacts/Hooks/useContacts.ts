// pages/contacts/Hooks/useContacts.ts
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listContacts } from '../Services/contactsService';
import { collectEventNamesFromContacts } from '../Services/eventNamesService';
import { queryKeys } from '@/services/api/queryClient';
import type { Contact } from '../types/contact.types';
import {
  filterContacts,
  hasActiveContactFilters,
  type ContactRecentFilter,
  type ContactSortId,
  type ContactSourceFilter,
} from '../Utils/contactFilters';

const EMPTY: Contact[] = [];

export function useContacts() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ContactSortId>('newest');
  const [source, setSource] = useState<ContactSourceFilter>('all');
  const [recent, setRecent] = useState<ContactRecentFilter>('all');
  const [eventName, setEventName] = useState('');
  const contactsQuery = useQuery({ queryKey: queryKeys.contacts, queryFn: listContacts });
  const contacts = contactsQuery.data ?? EMPTY;

  const eventNames = useMemo(() => collectEventNamesFromContacts(contacts), [contacts]);

  const filtered = useMemo(
    () => filterContacts(contacts, { query, sort, source, recent, eventName }),
    [contacts, eventName, query, recent, sort, source],
  );

  const filtersActive = useMemo(
    () => hasActiveContactFilters({ query, sort, source, recent, eventName }),
    [eventName, query, recent, sort, source],
  );

  const clearFilters = () => {
    setQuery('');
    setSort('newest');
    setSource('all');
    setRecent('all');
    setEventName('');
  };

  const changeQuery = (value: string) => { setEventName(''); setQuery(value); };
  const changeSort = (value: ContactSortId) => { setEventName(''); setSort(value); };
  const changeSource = (value: ContactSourceFilter) => { setEventName(''); setSource(value); };
  const changeRecent = (value: ContactRecentFilter) => { setEventName(''); setRecent(value); };

  return {
    query,
    setQuery: changeQuery,
    sort,
    setSort: changeSort,
    source,
    setSource: changeSource,
    recent,
    setRecent: changeRecent,
    eventName,
    setEventName,
    eventNames,
    filtersActive,
    clearFilters,
    contacts,
    filtered,
    loading: contactsQuery.isLoading,
    refreshing: contactsQuery.isRefetching,
    error: contactsQuery.error,
    refresh: contactsQuery.refetch,
  };
}
