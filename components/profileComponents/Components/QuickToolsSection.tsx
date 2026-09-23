// components/profileComponents/Components/QuickToolsSection.tsx
import { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import {
  FLOATING_TOOL_DEFINITIONS,
  MAX_QUICK_TOOLS,
  type FloatingToolId,
} from '@/components/toolsButton';

export function QuickToolsSection({
  toolsEnabled,
  setToolsEnabled,
  enabledTools,
  hydrated,
  toggleTool,
}: {
  toolsEnabled: boolean;
  setToolsEnabled: (enabled: boolean) => void;
  enabledTools: FloatingToolId[];
  hydrated: boolean;
  toggleTool: (toolId: FloatingToolId) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl bg-card dark:bg-dark-card">
      <TouchableOpacity
        className="flex-row items-center px-4 py-4"
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityLabel="Quick tools"
      >
        <View className="w-9 h-9 rounded-full bg-background dark:bg-dark-background items-center justify-center mr-3">
          <Wrench color={Colors.light.tint} size={18} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-textPrimary dark:text-dark-textPrimary font-medium">
            Quick tools
          </Text>
          <Text className="text-textMuted dark:text-dark-textMuted text-xs mt-0.5">
            {toolsEnabled ? `${enabledTools.length}/${MAX_QUICK_TOOLS} selected` : 'Off'}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp color={Colors.light.mutedText} size={18} strokeWidth={2} />
        ) : (
          <ChevronDown color={Colors.light.mutedText} size={18} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {expanded ? (
        <View className="border-t border-border px-4 pb-4 pt-4 dark:border-dark-border">
          <View className="flex-row items-center">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-dark-background">
              <Wrench color={Colors.light.tint} size={18} strokeWidth={2.2} />
            </View>
            <Text className="flex-1 font-medium text-textPrimary dark:text-dark-textPrimary">
              Enable quick tools
            </Text>
            <Switch
              disabled={!hydrated}
              value={toolsEnabled}
              onValueChange={setToolsEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
              thumbColor={Colors.palette.primaryWhite}
            />
          </View>

          <Text
            className={`mb-3 mt-4 text-xs ${
              toolsEnabled
                ? 'text-textMuted dark:text-dark-textMuted'
                : 'text-textMuted/50 dark:text-dark-textMuted/50'
            }`}
          >
            Choose up to {MAX_QUICK_TOOLS} tools to show on the floating button.
          </Text>

          <View className="flex-row">
            {FLOATING_TOOL_DEFINITIONS.map((tool) => {
              const Icon = tool.icon;
              const isToolEnabled = enabledTools.includes(tool.id);
              const limitReached = !isToolEnabled && enabledTools.length >= MAX_QUICK_TOOLS;
              const isDisabled = !hydrated || !toolsEnabled || limitReached;

              return (
                <TouchableOpacity
                  key={tool.id}
                  className="w-1/4 items-center px-1"
                  disabled={isDisabled}
                  onPress={() => toggleTool(tool.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={tool.label}
                  accessibilityState={{ checked: isToolEnabled, disabled: isDisabled }}
                >
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                      isToolEnabled && toolsEnabled
                        ? 'border-primary bg-primary/15'
                        : 'border-border bg-background dark:border-dark-border dark:bg-dark-background'
                    } ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <Icon
                      color={
                        isToolEnabled && toolsEnabled
                          ? Colors.light.tint
                          : Colors.light.mutedText
                      }
                      size={21}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    className={`mt-2 text-center text-[10px] leading-3 ${
                      isDisabled
                        ? 'text-textMuted/40 dark:text-dark-textMuted/40'
                        : 'text-textMuted dark:text-dark-textMuted'
                    }`}
                    numberOfLines={2}
                  >
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
