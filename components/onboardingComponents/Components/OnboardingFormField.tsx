import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
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

  return (
    <View className="mb-4 w-full">
      {/* Label and Character count row */}
      <View className="flex-row items-center justify-between mb-1.5 px-0.5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
          {label}
          {required && <Text className="text-error dark:text-dark-error font-bold"> *</Text>}
        </Text>
        {maxLength && (
          <Text className="text-[11px] font-medium text-textMuted dark:text-dark-textMuted">
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>

      {/* Input container */}
      <View
        className={`flex-row items-center rounded-2xl px-3.5 bg-slate-50 dark:bg-slate-900/70 border transition-all ${
          hasError
            ? 'border-error dark:border-dark-error bg-red-50/20 dark:bg-red-950/20'
            : isFocused
            ? 'border-primary dark:border-dark-primary shadow-sm shadow-blue-500/10'
            : 'border-slate-200 dark:border-slate-800'
        } ${multiline ? 'items-start py-3' : 'py-1'}`}
        style={multiline ? { minHeight: 104 } : { minHeight: 52 }}
      >
        {/* Leading icon */}
        {Icon && (
          <View className={`mr-2.5 ${multiline ? 'mt-1' : ''}`}>
            <Icon size={20} color={iconColor} strokeWidth={2} />
          </View>
        )}

        {/* Text Input */}
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
          className="flex-1 text-base font-normal text-textPrimary dark:text-dark-textPrimary py-2"
          style={multiline ? { minHeight: 80 } : undefined}
        />

        {/* Clear Button */}
        {showClear && (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
            className="p-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 ml-1 active:opacity-70"
          >
            <X
              size={14}
              color={theme === 'dark' ? '#cbd5e1' : '#64748b'}
              strokeWidth={2.5}
            />
          </Pressable>
        )}
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
