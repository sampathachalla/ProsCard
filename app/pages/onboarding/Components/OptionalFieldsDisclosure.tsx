import React, { useState, type ReactNode } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DISCLOSURE_ANIMATION = {
  duration: 220,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

export interface OptionalFieldsDisclosureProps {
  labelCollapsed: string;
  labelExpanded: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  hint?: string;
}

/**
 * Enterprise-standard progressive disclosure.
 * Uses a single LayoutAnimation easeInEaseOut — no decorative motion.
 */
export function OptionalFieldsDisclosure({
  labelCollapsed,
  labelExpanded,
  children,
  defaultExpanded = false,
  hint,
}: OptionalFieldsDisclosureProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    LayoutAnimation.configureNext(DISCLOSURE_ANIMATION);
    Haptics.selectionAsync().catch(() => {});
    setExpanded((prev) => !prev);
  };

  return (
    <View className="mt-1 mb-2">
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? labelExpanded : labelCollapsed}
        className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 active:opacity-80 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
            {expanded ? labelExpanded : labelCollapsed}
          </Text>
          {hint && !expanded ? (
            <Text className="mt-0.5 text-xs text-textMuted dark:text-dark-textMuted">
              {hint}
            </Text>
          ) : null}
        </View>
        {expanded ? (
          <ChevronUp size={18} className="text-textMuted dark:text-dark-textMuted" />
        ) : (
          <ChevronDown size={18} className="text-textMuted dark:text-dark-textMuted" />
        )}
      </Pressable>

      {expanded ? <View className="mt-4">{children}</View> : null}
    </View>
  );
}
