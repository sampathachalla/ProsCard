// components/contactsComponents/Hooks/useContacts.ts
import { useMemo, useState } from 'react';
import { getContacts } from '../Services/contactsService';

export function useContacts() {
  const [query, setQuery] = useState('');
  const contacts = getContacts();

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

  return { query, setQuery, contacts, filtered };
}
