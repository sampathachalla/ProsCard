import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  type KeyboardTypeOptions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

export interface OnboardingFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: LucideIcon;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  autoCorrect?: boolean;
}

export function OnboardingFormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon: Icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = multiline ? 4 : 1,
  maxLength,
  required = false,
  hint,
  secureTextEntry = false,
  editable = true,
  autoCorrect = true,
}: OnboardingFormFieldProps) {
  const { theme } = useThemeContext();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const showClear = editable && !multiline && Boolean(value && value.length > 0);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChangeText('');
  };

  const getIconColor = () => {
    if (hasError) {
      return theme === 'dark' ? Colors.dark.error : Colors.light.error;
    }
    if (isFocused) {
      return theme === 'dark' ? Colors.dark.tint : Colors.light.tint;
    }
    return theme === 'dark' ? Colors.dark.mutedText : Colors.light.mutedText;
  };

  const iconColor = getIconColor();

  const isMinimal = label.trim().length === 0;

  return (
    <View className={`w-full ${isMinimal ? 'mb-7' : 'mb-4'}`}>
      {label.trim().length > 0 ? (
        <View className="mb-1.5 px-0.5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
            {label}
            {required && <Text className="text-error dark:text-dark-error font-bold"> *</Text>}
          </Text>
        </View>
      ) : null}

      <View className="pb-2">
        <View
          className={`flex-row items-center ${multiline ? 'items-start pt-1' : ''}`}
          style={multiline ? { minHeight: 96 } : { minHeight: 44 }}
        >
          {Icon ? (
            <View className={`mr-2.5 ${multiline ? 'mt-1' : ''}`}>
              <Icon size={20} color={iconColor} strokeWidth={2} />
            </View>
          ) : null}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || label}
            placeholderTextColor={theme === 'dark' ? '#64748b' : '#94a3b8'}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            secureTextEntry={secureTextEntry}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textAlignVertical={multiline ? 'top' : 'center'}
            accessibilityLabel={label}
            accessibilityHint={hint || placeholder}
            underlineColorAndroid="transparent"
            className={`flex-1 border-0 bg-transparent font-normal text-textPrimary dark:text-dark-textPrimary py-1.5 outline-none ${
              isMinimal ? 'text-lg' : 'text-base'
            }`}
            style={[
              multiline ? { minHeight: 72 } : null,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            ]}
          />

          {showClear ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${label}`}
              className="ml-1 p-1 active:opacity-70"
            >
              <X
                size={16}
                color={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth={2.5}
              />
            </Pressable>
          ) : null}
        </View>

        <View
          className={`mt-1 h-[2px] w-full rounded-full ${
            hasError
              ? 'bg-error dark:bg-dark-error'
              : isFocused
              ? 'bg-primary dark:bg-dark-primary'
              : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />
      </View>

      {/* Inline Validation Error Message */}
      {hasError && (
        <View className="flex-row items-center mt-1.5 px-1">
          <AlertCircle
            size={13}
            color={theme === 'dark' ? Colors.dark.error : Colors.light.error}
            strokeWidth={2.2}
          />
          <Text className="text-xs font-medium text-error dark:text-dark-error ml-1">
            {error}
          </Text>
        </View>
      )}

      {/* Helper Hint Text */}
      {!hasError && hint && (
        <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-1 px-1">
          {hint}
        </Text>
      )}
    </View>
  );
}
