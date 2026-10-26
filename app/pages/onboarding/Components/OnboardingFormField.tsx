import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useOnboardingScroll } from './onboardingScrollContext';

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
  /** Tighter vertical spacing for inline name rows. */
  compact?: boolean;
  /** Hide the trailing clear (×) control. */
  hideClear?: boolean;
  variant?: 'underline' | 'boxed';
  /** Show `{length}/{maxLength}` in the field (boxed variant). */
  showCharacterCount?: boolean;
  characterCountPlacement?: 'top' | 'bottom';
  /** Center input text and character count (tagline-style steps). */
  centerAlign?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Shared metrics so focused inputs never clip descenders (g/p/y).
 * Avoid setting `lineHeight` on TextInput — on iOS it often crops glyphs when focused.
 */
function singleLineInputStyle(fontSize: number): TextStyle {
  return {
    minHeight: 44,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  };
}

function multilineInputStyle(fontSize: number): TextStyle {
  return {
    minHeight: 84,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  };
}

function webOutlineStyle(): StyleProp<TextStyle> {
  return Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;
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
  compact = false,
  hideClear = false,
  variant = 'boxed',
  showCharacterCount = false,
  characterCountPlacement = 'bottom',
  centerAlign = false,
  onFocus,
  onBlur,
}: OnboardingFormFieldProps) {
  const { theme } = useThemeContext();
  const onboardingScroll = useOnboardingScroll();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const showClear =
    !hideClear && editable && !multiline && Boolean(value && value.length > 0);

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
    return theme === 'dark' ? '#94a3b8' : '#64748b';
  };

  const iconColor = getIconColor();

  const fieldLabel = label.trim().length > 0 ? label : placeholder ?? label;
  const countLabel =
    showCharacterCount && maxLength != null ? `${value.length}/${maxLength}` : null;

  const inputFontSize = 16;

  const sharedInputProps = {
    value,
    onChangeText,
    placeholder: placeholder || label,
    placeholderTextColor: theme === 'dark' ? '#64748b' : '#94a3b8',
    keyboardType,
    autoCapitalize,
    autoCorrect,
    secureTextEntry,
    editable,
    multiline,
    numberOfLines,
    maxLength,
    onFocus: (event: { nativeEvent: { target: number } }) => {
      setIsFocused(true);
      onboardingScroll?.ensureFocusedVisible(event.nativeEvent.target);
      onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    },
    textAlignVertical: (multiline ? 'top' : 'center') as 'top' | 'center',
    accessibilityLabel: fieldLabel,
    accessibilityHint: hint || placeholder,
    underlineColorAndroid: 'transparent' as const,
  };

  return (
    <View className={`${compact ? 'mb-3.5' : 'mb-5'} w-full`}>
      {label.trim().length > 0 || (countLabel && characterCountPlacement === 'top') ? (
        <View className="mb-2 flex-row items-center justify-between">
          {label.trim().length > 0 ? (
            <Text
              className={`text-[14px] font-normal ${
                hasError
                  ? 'text-error dark:text-dark-error'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
              {required ? <Text className="text-error dark:text-dark-error"> *</Text> : null}
            </Text>
          ) : (
            <View />
          )}
          {countLabel && characterCountPlacement === 'top' ? (
            <Text className="text-xs font-normal text-slate-500 dark:text-slate-400">
              {countLabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        className={`rounded-lg border px-4 ${
          hasError
            ? 'border-error bg-red-50/80 dark:border-dark-error dark:bg-red-950/30'
            : isFocused
              ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
              : 'border-transparent bg-slate-100 dark:bg-dark-card'
        }`}
        style={{
          minHeight: multiline ? 104 : 54,
          paddingTop: multiline ? 10 : 5,
          paddingBottom: multiline ? 10 : 5,
          justifyContent: multiline ? 'flex-start' : 'center',
        }}
      >
        <View className={`flex-row ${multiline ? 'items-start' : 'items-center'}`}>
          {Icon ? (
            <View className={`mr-3 ${multiline ? 'mt-2.5' : ''}`}>
              <Icon size={18} color={iconColor} strokeWidth={2} />
            </View>
          ) : null}

          <TextInput
            {...sharedInputProps}
            className="flex-1 border-0 bg-transparent font-normal text-textPrimary outline-none dark:text-dark-textPrimary"
            style={[
              multiline ? multilineInputStyle(inputFontSize) : singleLineInputStyle(inputFontSize),
              centerAlign ? { textAlign: 'center' as const } : null,
              webOutlineStyle(),
            ]}
          />

          {showClear ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${fieldLabel}`}
              className="ml-1 p-1 active:opacity-70"
            >
              <X
                size={16}
                color={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth={2.2}
              />
            </Pressable>
          ) : null}
        </View>

        {countLabel && characterCountPlacement === 'bottom' ? (
          <Text
            className={`mt-1 text-xs font-normal text-slate-500 dark:text-slate-400 ${
              centerAlign ? 'text-center' : 'text-right'
            }`}
          >
            {countLabel}
          </Text>
        ) : null}
      </View>

      {hasError ? (
        <View className="mt-1.5 flex-row items-center px-0.5">
          <AlertCircle
            size={13}
            color={theme === 'dark' ? Colors.dark.error : Colors.light.error}
            strokeWidth={2.2}
          />
          <Text className="ml-1 text-xs font-medium text-error dark:text-dark-error">{error}</Text>
        </View>
      ) : null}
      {!hasError && hint ? (
        <Text className="mt-1.5 px-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</Text>
      ) : null}
    </View>
  );
}
