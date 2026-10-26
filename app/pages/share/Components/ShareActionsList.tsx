import React from 'react';
import { View } from 'react-native';

import { SHARE_PAGE_ACTIONS } from '../Config/shareActionsConfig';
import type { ShareActionId } from '../types/share.types';
import { ShareActionRow } from './ShareActionRow';

export interface ShareActionsListProps {
  copiedLink?: boolean;
  activeQrPresetLabel?: string;
  onActionPress: (actionId: ShareActionId) => void;
}

export function ShareActionsList({
  copiedLink = false,
  activeQrPresetLabel,
  onActionPress,
}: ShareActionsListProps) {
  return (
    <View className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/90 dark:border-slate-800/90 dark:bg-dark-card">
      {SHARE_PAGE_ACTIONS.map((item, index) => {
        const isLast = index === SHARE_PAGE_ACTIONS.length - 1;
        let badgeText: string | undefined;
        if (item.id === 'copy_link' && copiedLink) {
          badgeText = 'Copied!';
        } else if (item.id === 'customize_qr' && activeQrPresetLabel) {
          badgeText = activeQrPresetLabel;
        }

        return (
          <ShareActionRow
            key={item.id}
            item={item}
            isLast={isLast}
            badgeText={badgeText}
            onPress={() => onActionPress(item.id)}
          />
        );
      })}
    </View>
  );
}
