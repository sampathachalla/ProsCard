import { Alert, Platform } from 'react-native';
import { Contact } from 'expo-contacts';
import { saveOrShareContact, type VCardContact } from './vcard';

/**
 * Directly opens the native device contact form (iOS CNContactViewController or Android Contact Intent)
 * prefilled with the contact details, without displaying the generic OS share sheet
 * and without requesting contacts access permissions (which triggers iOS 18's Limited Contacts Access picker).
 */
export async function saveDirectlyToNativeContacts(contact: VCardContact): Promise<boolean> {
  // On web, download the vCard file directly
  if (Platform.OS === 'web') {
    await saveOrShareContact(contact);
    return true;
  }

  try {
    // Split name into given and family names
    const rawName = contact.name?.trim() || '';
    let givenName = contact.firstName?.trim() || '';
    let familyName = contact.lastName?.trim() || '';

    if (!givenName && !familyName && rawName) {
      const parts = rawName.split(/\s+/);
      if (parts.length > 1) {
        givenName = parts[0];
        familyName = parts.slice(1).join(' ');
      } else {
        givenName = rawName;
      }
    }

    // 1. Directly open the native OS "Create Contact" form via modern expo-contacts Contact.presentCreateForm
    // NOTE: This does NOT require contacts permission because the OS manages the creation form.
    if (typeof Contact?.presentCreateForm === 'function') {
      const record = {
        givenName: givenName || 'Contact',
        familyName: familyName || undefined,
        company: contact.company?.trim() || undefined,
        jobTitle: contact.title?.trim() || undefined,
        note: contact.note?.trim() || undefined,
        phones: contact.phone?.trim()
          ? [{ label: 'work', number: contact.phone.trim() }]
          : undefined,
        emails: contact.email?.trim()
          ? [{ label: 'work', address: contact.email.trim() }]
          : undefined,
        urlAddresses: contact.website?.trim()
          ? [{ label: 'work', url: contact.website.trim() }]
          : undefined,
        addresses: contact.address?.trim()
          ? [{ label: 'work', street: contact.address.trim() }]
          : undefined,
        image: contact.photoUrl && contact.photoUrl.startsWith('file://')
          ? contact.photoUrl
          : undefined,
      };

      try {
        const result = await Contact.presentCreateForm(record);
        return result ?? true;
      } catch {
        // Expo Go can expose the new JavaScript API while its current native
        // runtime does not yet provide the matching create-form method. Try
        // the bundled legacy create controller before falling back to a vCard.
      }
    }

    // 2. Fallback: legacy presentFormAsync with isNew: true
    try {
      const legacy = await import('expo-contacts/legacy');
      if (typeof legacy?.presentFormAsync === 'function') {
        await legacy.presentFormAsync(
          undefined,
          {
            contactType: legacy.ContactTypes.Person,
            name: rawName || [givenName, familyName].filter(Boolean).join(' ') || 'Contact',
            firstName: givenName || 'Contact',
            lastName: familyName || undefined,
            company: contact.company?.trim() || undefined,
            jobTitle: contact.title?.trim() || undefined,
            note: contact.note?.trim() || undefined,
            phoneNumbers: contact.phone?.trim()
              ? [{ label: 'work', number: contact.phone.trim() }]
              : undefined,
            emails: contact.email?.trim()
              ? [{ label: 'work', email: contact.email.trim() }]
              : undefined,
            urlAddresses: contact.website?.trim()
              ? [{ label: 'work', url: contact.website.trim() }]
              : undefined,
            addresses: contact.address?.trim()
              ? [{ label: 'work', street: contact.address.trim() }]
              : undefined,
          },
          { isNew: true }
        );
        return true;
      }
    } catch {
      // Fallback to vCard below
    }

    // 3. Ultimate fallback if native form is not present
    await saveOrShareContact(contact);
    return true;
  } catch (error) {
    // If native form fails for any reason, fallback to vCard
    try {
      await saveOrShareContact(contact);
      return true;
    } catch {
      Alert.alert('Unable to save contact', error instanceof Error ? error.message : 'Please try again.');
      return false;
    }
  }
}
