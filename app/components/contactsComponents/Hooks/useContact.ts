// components/contactsComponents/Hooks/useContact.ts
import { useQuery } from '@tanstack/react-query';
import { getContact } from '../Services/contactsService';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import type { Contact } from '../types/contact.types';

/** One contact, shown instantly from the contacts list cache and refreshed from the API. */
export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contact(id ?? ''),
    queryFn: () => getContact(id!),
    enabled: Boolean(id),
    initialData: () => queryClient.getQueryData<Contact[]>(queryKeys.contacts)?.find((contact) => contact.id === id),
  });
}
