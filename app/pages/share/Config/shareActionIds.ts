/** Stable public contract for the 13 actions rendered by the Share page. */
export const SHARE_ACTION_IDS = [
  'share_card',
  'copy_link',
  'add_to_wallet',
  'add_qr_lockscreen',
  'add_qr_homescreen',
  'share_email',
  'share_namedrop',
  'share_linkedin',
  'share_whatsapp',
  'share_instagram',
  'share_x',
  'save_qr_photos',
  'customize_qr',
] as const;

export type ShareActionId = (typeof SHARE_ACTION_IDS)[number];
