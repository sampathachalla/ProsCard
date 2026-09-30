// components/contactsComponents/types/contact.types.ts
export type Contact = {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email?: string;
  initials: string;
  color: string;
  sourceCardId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;
