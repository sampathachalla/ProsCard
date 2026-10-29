import { Platform } from 'react-native';

import { SHARE_ACTION_IDS } from '../Config/shareActionIds';
import { SHARE_PAGE_ACTIONS } from '../Config/shareActionsConfig';
import type { ShareActionItemConfig } from '../types/share.types';

/** Share rows in `SHARE_ACTION_IDS` order (single source of truth for the list UI). */
export function orderedVisibleShareActions(): ShareActionItemConfig[] {
  const byId = new Map(SHARE_PAGE_ACTIONS.map((item) => [item.id, item]));
  return SHARE_ACTION_IDS.map((id) => byId.get(id)).filter((item): item is ShareActionItemConfig => {
    if (!item) return false;
    return !item.platforms || item.platforms.includes(Platform.OS as 'ios' | 'android' | 'web');
  });
}

export function shareActionIdsForVisibleRows(actions: ShareActionItemConfig[]): string[] {
  return actions.map((item) => item.id);
}
