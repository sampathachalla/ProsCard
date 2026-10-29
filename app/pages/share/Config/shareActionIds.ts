/** Stable public contract for the actions rendered by the Share page. */
export const SHARE_ACTION_IDS = [
  'share_card',
  'copy_link',
  'add_to_wallet',
  'add_qr_lockscreen',
  'add_qr_homescreen',
  'save_qr_photos',
  'customize_qr',
  'show_live_activity',
  'share_email',
  'share_namedrop',
  'share_linkedin',
  'share_whatsapp',
  'share_instagram',
  'share_x',
] as const;

export type ShareActionId = (typeof SHARE_ACTION_IDS)[number] | 'share_social';

export const SOCIAL_SHARE_ACTION_IDS: readonly ShareActionId[] = [
  'share_linkedin',
  'share_whatsapp',
  'share_instagram',
  'share_x',
] as const;
