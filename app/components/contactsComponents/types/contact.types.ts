// components/contactsComponents/types/contact.types.ts
export type Contact = {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  notes?: string;
  /** Scanned business-card photo; set by the backend when the upload is confirmed. */
  cardImageUrl?: string;
  initials: string;
  color: string;
  sourceCardId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'cardImageUrl'>;
