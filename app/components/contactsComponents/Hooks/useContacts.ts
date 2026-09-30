// components/contactsComponents/Hooks/useContacts.ts
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listContacts } from '../Services/contactsService';
import { queryKeys } from '@/services/api/queryClient';
import type { Contact } from '../types/contact.types';

const EMPTY: Contact[] = [];

export function useContacts() {
  const [query, setQuery] = useState('');
  const contactsQuery = useQuery({ queryKey: queryKeys.contacts, queryFn: listContacts });
  const contacts = contactsQuery.data ?? EMPTY;

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  return {
    query,
    setQuery,
    contacts,
    filtered,
    loading: contactsQuery.isLoading,
    refreshing: contactsQuery.isRefetching,
    error: contactsQuery.error,
    refresh: contactsQuery.refetch,
  };
}
