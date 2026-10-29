import React, { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { ShareActionId } from '../types/share.types';
import {
  SHARE_VIA_SOCIAL_ACTION,
  SOCIAL_SHARE_ACTION_IDS,
} from '../Config/shareActionsConfig';
import { orderedVisibleShareActions } from '../Utils/shareActionsOrder';
import { ShareActionRow } from './ShareActionRow';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ShareActionsListProps {
  copiedLink?: boolean;
  liveActivityActive?: boolean;
  activeQrPresetLabel?: string;
  onActionPress: (actionId: ShareActionId) => void;
  initialSocialExpanded?: boolean;
}

export function ShareActionsList({
  copiedLink = false,
  liveActivityActive = false,
  activeQrPresetLabel,
  onActionPress,
  initialSocialExpanded = false,
}: ShareActionsListProps) {
  const [socialExpanded, setSocialExpanded] = useState(initialSocialExpanded);

  const actions = useMemo(() => orderedVisibleShareActions(), []);

  const mainActions = useMemo(
    () => actions.filter((item) => !SOCIAL_SHARE_ACTION_IDS.includes(item.id)),
    [actions],
  );

  const socialActions = useMemo(
    () => actions.filter((item) => SOCIAL_SHARE_ACTION_IDS.includes(item.id)),
    [actions],
  );

  const hasSocialActions = socialActions.length > 0;

  const toggleSocial = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSocialExpanded((prev) => !prev);
  }, []);

  return (
    <View className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/90 dark:border-slate-800/90 dark:bg-dark-card">
      {mainActions.map((item, index) => {
        const isLastMain = !hasSocialActions && index === mainActions.length - 1;
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
            isLast={isLastMain}
            badgeText={badgeText}
            onPress={() => onActionPress(item.id)}
          />
        );
      })}

      {hasSocialActions ? (
        <>
          <ShareActionRow
            item={SHARE_VIA_SOCIAL_ACTION}
            isLast={!socialExpanded}
            isDropdown
            isExpanded={socialExpanded}
            onPress={toggleSocial}
          />
          {socialExpanded
            ? socialActions.map((item, index) => {
                const isLast = index === socialActions.length - 1;
                return (
                  <ShareActionRow
                    key={item.id}
                    item={item}
                    isLast={isLast}
                    isSubItem
                    onPress={() => onActionPress(item.id)}
                  />
                );
              })
            : null}
        </>
      ) : null}
    </View>
  );
}
