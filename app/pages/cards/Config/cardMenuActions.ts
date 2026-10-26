// pages/cards/Config/cardMenuActions.ts
import { Copy, Eye, Lock, Pencil, Share2, Wallet, type LucideIcon } from 'lucide-react-native';

export type CardMenuActionId = 'edit' | 'preview' | 'share' | 'duplicate' | 'wallet' | 'lockscreen';

export type CardMenuAction = {
  id: CardMenuActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

/** Items in the card detail "⋯" menu, in display order. */
export const CARD_MENU_ACTIONS: CardMenuAction[] = [
  { id: 'edit', label: 'Edit', description: 'Change details, layout and theme', icon: Pencil, color: '#2563eb' },
  { id: 'preview', label: 'Preview', description: 'Open the card as others see it', icon: Eye, color: '#0284c7' },
  { id: 'share', label: 'Share', description: 'Send your card link', icon: Share2, color: '#7c3aed' },
  { id: 'duplicate', label: 'Duplicate', description: 'Make a copy of this card', icon: Copy, color: '#0891b2' },
  { id: 'wallet', label: 'Add to wallet', description: 'Save this card as a wallet pass', icon: Wallet, color: '#059669' },
  { id: 'lockscreen', label: 'Add to lockscreen', description: 'Save the QR code for your lock screen', icon: Lock, color: '#ea580c' },
];
