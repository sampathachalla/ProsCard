import { Copy, ExternalLink, Pencil, WalletCards } from 'lucide-react-native';
import type { FloatingToolDefinition, FloatingToolId } from './types';

export const DEFAULT_FLOATING_TOOLS: FloatingToolId[] = ['copy', 'wallet', 'edit'];

export const FLOATING_TOOL_DEFINITIONS: FloatingToolDefinition[] = [
  { icon: Copy, id: 'copy', label: 'Copy link' },
  { icon: WalletCards, id: 'wallet', label: 'Add to wallet' },
  { icon: Pencil, id: 'edit', label: 'Edit card' },
  { icon: ExternalLink, id: 'open', label: 'Open link' },
];
