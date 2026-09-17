// components/editViewComponents/types/editView.types.ts
export type EditableCard = {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  gradient: [string, string];
};

export type CardFieldKey = 'name' | 'title' | 'company' | 'phone' | 'email';
