import type { LucideIcon } from 'lucide-react-native';

export type FloatingToolId = 'copy' | 'edit' | 'open' | 'wallet';

export type FloatingToolDefinition = {
  icon: LucideIcon;
  id: FloatingToolId;
  label: string;
};

export type FloatingToolAction = FloatingToolDefinition & {
  onSelect: () => void | Promise<void>;
};
