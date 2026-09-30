// components/scannerComponents/Services/scannerService.ts
import { Colors } from '@/constants/Colors';
import { parseShareSlug, resolveSharedCard, type SharedCard } from '@/components/sharingComponents/Services/sharingService';
import { initialsFor, saveContact } from '@/components/contactsComponents/Services/contactsService';
import type { Contact } from '@/components/contactsComponents/types/contact.types';
import { queryClient, queryKeys } from '@/services/api/queryClient';

/** Resolves a scanned QR payload to the shared ProsCard it points at. */
export async function lookupScannedCard(data: string): Promise<SharedCard> {
  const slug = parseShareSlug(data);
  if (!slug) throw new Error('This QR code is not a ProsCard share link.');
  return resolveSharedCard(slug);
}

export async function saveScannedContact(card: SharedCard): Promise<Contact> {
  const contact = await saveContact({
    name: card.name,
    title: card.title ?? '',
    company: card.company ?? '',
    phone: card.phone ?? '',
    email: card.email ?? '',
    initials: initialsFor(card.name),
    color: card.gradient?.[0] ?? Colors.light.tint,
    sourceCardId: card.id,
  });
  await queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
  return contact;
}
