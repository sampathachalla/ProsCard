import { Colors } from '@/constants/Colors';
import { apiRequest } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { Alert } from 'react-native';
import { cacheMediaFileFromUri, confirmMedia, requestMediaUpload, uploadToObjectStorage } from '@/components/profileComponents/Services/mediaService';
import { prepareCardPhotoForUpload } from '@/components/scannerComponents/Services/cardReaderService';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import type { CapturedCard } from '@/components/scannerComponents/types/scanner.types';
import type { Contact, ContactInput } from '../types/contact.types';

/** Fixture contacts, only used in auth test mode (no backend). */
const TEST_CONTACTS: Contact[] = [
  { id: '1', name: 'Ava Thompson', title: 'Marketing Lead', company: 'Northwind Co.', phone: '+1 (555) 233-1190', initials: 'AT', color: Colors.light.tint },
  { id: '2', name: 'Liam Carter', title: 'Software Engineer', company: 'Vertex Labs', phone: '+1 (555) 887-2201', initials: 'LC', color: Colors.palette.toggleYellow },
  { id: '3', name: 'Priya Nair', title: 'UX Designer', company: 'Studio Loop', phone: '+1 (555) 447-8823', initials: 'PN', color: Colors.palette.darkBodyAlt },
  { id: '4', name: 'Marcus Lee', title: 'Sales Director', company: 'Bright Path', phone: '+1 (555) 992-0034', initials: 'ML', color: Colors.palette.brandCyan },
];

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase() || '?';
}

export async function listContacts(): Promise<Contact[]> {
  if (AUTH_TEST_MODE) return TEST_CONTACTS;
  return apiRequest<Contact[]>('/contacts');
}

export async function getContact(id: string): Promise<Contact> {
  if (AUTH_TEST_MODE) {
    const contact = TEST_CONTACTS.find((item) => item.id === id);
    if (!contact) throw new Error('Contact not found.');
    return contact;
  }
  return apiRequest<Contact>(`/contacts/${encodeURIComponent(id)}`);
}

/** Creates a contact; saving the same source card again updates the existing contact. */
export async function saveContact(input: ContactInput): Promise<Contact> {
  if (AUTH_TEST_MODE) return { ...input, id: `local-${Date.now()}` };
  return apiRequest<Contact>('/contacts', { method: 'POST', body: input });
}

type CardPhoto = Pick<CapturedCard, 'uri' | 'mimeType' | 'fileName'>;

/** Uploads a business-card photo to OCI object storage and attaches it to the contact. Returns its content URL. */
export async function uploadContactCardImage(contactId: string, image: CardPhoto): Promise<string> {
  if (AUTH_TEST_MODE) return image.uri;
  // Camera-sized photos (native scanner, unread photos) are shrunk first; already-small ones are sent as is.
  const photo = await prepareCardPhotoForUpload(image);
  const blob = await (await fetch(photo.uri)).blob();
  const contentType = photo.mimeType || blob.type || 'image/jpeg';
  const fileName = photo.fileName || `business-card-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
  const ticket = await requestMediaUpload({
    kind: 'contactCard', scope: 'contact', contactId, fileName, contentType, sizeBytes: blob.size,
  });
  await uploadToObjectStorage(ticket, blob);
  const confirmed = await confirmMedia(ticket.mediaId);
  // The photo is already on the phone: seed the media cache so screens never download it again.
  await cacheMediaFileFromUri(ticket.mediaId, photo.uri);
  return confirmed.contentUrl;
}

/** Puts a contact into the cached list and detail queries so screens show it straight away. */
function cacheContact(contact: Contact, position: 'top' | 'inPlace') {
  queryClient.setQueryData<Contact[]>(queryKeys.contacts, (list) => {
    if (!list) return list;
    if (list.some((item) => item.id === contact.id)) return list.map((item) => (item.id === contact.id ? { ...item, ...contact } : item));
    return position === 'top' ? [contact, ...list] : [...list, contact];
  });
  queryClient.setQueryData<Contact>(queryKeys.contact(contact.id), (current) => ({ ...current, ...contact }));
}

/**
 * Uploads the card photo after the contact is saved, so saving never waits on the network transfer.
 * Until it finishes, screens show the photo from the phone; afterwards the stored copy takes over.
 */
function uploadCardPhotoInBackground(contact: Contact, image: CardPhoto) {
  void uploadContactCardImage(contact.id, image)
    .then((cardImageUrl) => cacheContact({ ...contact, cardImageUrl }, 'inPlace'))
    .catch((reason) => {
      Alert.alert(
        'Card photo not uploaded',
        `${contact.name} was saved, but the card photo could not be uploaded${reason instanceof Error ? `: ${reason.message}` : ''}. Open the contact and add the photo again.`,
      );
    })
    .finally(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    });
}

/**
 * Creates a contact and stores its business-card photo. Resolves as soon as the contact exists; the
 * photo uploads in the background (typed details are never lost if that upload fails).
 */
export async function createContactWithCard(input: ContactInput, image?: CardPhoto | null): Promise<Contact> {
  const contact = await saveContact(input);
  cacheContact(image ? { ...contact, cardImageUrl: image.uri } : contact, 'top');
  if (image) uploadCardPhotoInBackground(contact, image);
  else void queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
  return contact;
}

/** Saves edits to a contact; a new card photo replaces the stored one in the background. */
export async function updateContactWithCard(id: string, input: ContactInput, image?: CardPhoto | null): Promise<Contact> {
  const contact = AUTH_TEST_MODE
    ? { ...input, id }
    : await apiRequest<Contact>(`/contacts/${encodeURIComponent(id)}`, { method: 'PUT', body: input });
  cacheContact(image ? { ...contact, cardImageUrl: image.uri } : contact, 'inPlace');
  if (image) uploadCardPhotoInBackground(contact, image);
  else void queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  if (AUTH_TEST_MODE) return;
  await apiRequest(`/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
