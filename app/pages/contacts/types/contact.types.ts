// pages/contacts/types/contact.types.ts
export type ContactCaptureKind = 'business_card' | 'badge' | 'manual' | 'qr';

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
  /** How this contact was captured; older records may omit this and are inferred in filters. */
  captureKind?: ContactCaptureKind;
  /** Event or conference name for badge scans; also used for search and filters. */
  eventName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'cardImageUrl'>;
