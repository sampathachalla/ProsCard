import { Colors } from '@/constants/Colors';
import { apiRequest } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import { confirmMedia, requestMediaUpload, uploadToObjectStorage } from '@/components/profileComponents/Services/mediaService';
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

/** Creates a contact; saving the same source card again updates the existing contact. */
export async function saveContact(input: ContactInput): Promise<Contact> {
  if (AUTH_TEST_MODE) return { ...input, id: `local-${Date.now()}` };
  return apiRequest<Contact>('/contacts', { method: 'POST', body: input });
}

/** Uploads a business-card photo to OCI object storage and attaches it to the contact. Returns its content URL. */
export async function uploadContactCardImage(contactId: string, image: Pick<CapturedCard, 'uri' | 'mimeType' | 'fileName'>): Promise<string> {
  if (AUTH_TEST_MODE) return image.uri;
  const blob = await (await fetch(image.uri)).blob();
  const contentType = image.mimeType || blob.type || 'image/jpeg';
  const fileName = image.fileName || `business-card-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
  const ticket = await requestMediaUpload({
    kind: 'contactCard', scope: 'contact', contactId, fileName, contentType, sizeBytes: blob.size,
  });
  await uploadToObjectStorage(ticket, blob);
  const confirmed = await confirmMedia(ticket.mediaId);
  return confirmed.contentUrl;
}

/**
 * Creates a contact and, when given, stores its business-card photo.
 * The contact is kept even if the photo upload fails, so typed details are never lost.
 */
export async function createContactWithCard(
  input: ContactInput,
  image?: Pick<CapturedCard, 'uri' | 'mimeType' | 'fileName'> | null,
): Promise<{ contact: Contact; imageError?: Error }> {
  const contact = await saveContact(input);
  if (!image) return { contact };
  try {
    return { contact: { ...contact, cardImageUrl: await uploadContactCardImage(contact.id, image) } };
  } catch (reason) {
    return { contact, imageError: reason instanceof Error ? reason : new Error('Card photo upload failed.') };
  }
}

export async function deleteContact(id: string): Promise<void> {
  if (AUTH_TEST_MODE) return;
  await apiRequest(`/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
