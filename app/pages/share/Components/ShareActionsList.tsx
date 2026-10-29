import React, { useMemo } from 'react';
import { View } from 'react-native';

import type { ShareActionId } from '../types/share.types';
import { orderedVisibleShareActions } from '../Utils/shareActionsOrder';
import { ShareActionRow } from './ShareActionRow';

export interface ShareActionsListProps {
  copiedLink?: boolean;
  liveActivityActive?: boolean;
  activeQrPresetLabel?: string;
  onActionPress: (actionId: ShareActionId) => void;
}

export function ShareActionsList({
  copiedLink = false,
  liveActivityActive = false,
  activeQrPresetLabel,
  onActionPress,
}: ShareActionsListProps) {
  const actions = useMemo(() => orderedVisibleShareActions(), []);

  return (
    <View className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/90 dark:border-slate-800/90 dark:bg-dark-card">
      {actions.map((item, index) => {
        const isLast = index === actions.length - 1;
        let badgeText: string | undefined;
        if (item.id === 'copy_link' && copiedLink) {
          badgeText = 'Copied!';
        } else if (item.id === 'show_live_activity' && liveActivityActive) {
          badgeText = 'Live';
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
