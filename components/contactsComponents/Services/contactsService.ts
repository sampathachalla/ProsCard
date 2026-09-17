// components/contactsComponents/Services/contactsService.ts
import { Colors } from '@/constants/Colors';
import type { Contact } from '../types/contact.types';

export const CONTACTS: Contact[] = [
  { id: '1', name: 'Ava Thompson', title: 'Marketing Lead', company: 'Northwind Co.', phone: '+1 (555) 233-1190', initials: 'AT', color: Colors.light.tint },
  { id: '2', name: 'Liam Carter', title: 'Software Engineer', company: 'Vertex Labs', phone: '+1 (555) 887-2201', initials: 'LC', color: Colors.palette.toggleYellow },
  { id: '3', name: 'Priya Nair', title: 'UX Designer', company: 'Studio Loop', phone: '+1 (555) 447-8823', initials: 'PN', color: Colors.palette.darkBodyAlt },
  { id: '4', name: 'Marcus Lee', title: 'Sales Director', company: 'Bright Path', phone: '+1 (555) 992-0034', initials: 'ML', color: Colors.palette.brandCyan },
];

export function getContacts(): Contact[] {
  return CONTACTS;
}
