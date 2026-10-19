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
    minHeight: 88,
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
  variant = 'underline',
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
    return theme === 'dark' ? Colors.dark.mutedText : Colors.light.mutedText;
  };

  const iconColor = getIconColor();

  const isMinimal = label.trim().length === 0;
  const fieldLabel = label.trim().length > 0 ? label : placeholder ?? label;
  const isBoxed = variant === 'boxed';
  const countLabel =
    showCharacterCount && maxLength != null ? `${value.length}/${maxLength}` : null;

  const underlineFontSize = isMinimal ? 18 : compact ? 16 : 17;
  const boxedFontSize = 16;

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

  if (isBoxed) {
    return (
      <View className="mb-4 w-full">
        {label.trim().length > 0 ? (
          <View className="mb-1.5 px-0.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
              {label}
              {required && <Text className="text-error dark:text-dark-error font-bold"> *</Text>}
            </Text>
          </View>
        ) : null}

        <View
          className={`rounded-2xl border px-4 ${
            hasError
              ? 'border-error bg-red-50/80 dark:border-dark-error dark:bg-red-950/25'
              : isFocused
                ? 'border-primary bg-white dark:border-dark-primary dark:bg-slate-900'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80'
          }`}
          style={{
            minHeight: multiline ? 120 : 56,
            paddingTop: multiline ? 12 : 8,
            paddingBottom: multiline ? 12 : 8,
            justifyContent: multiline ? 'flex-start' : 'center',
          }}
        >
          {countLabel && characterCountPlacement === 'top' ? (
            <Text className="mb-1 self-end text-xs font-medium text-textMuted dark:text-dark-textMuted">
              {countLabel}
            </Text>
          ) : null}
          <TextInput
            {...sharedInputProps}
            className="w-full border-0 bg-transparent text-textPrimary dark:text-dark-textPrimary outline-none"
            style={[
              multiline ? multilineInputStyle(boxedFontSize) : singleLineInputStyle(boxedFontSize),
              webOutlineStyle(),
            ]}
          />
          {countLabel && characterCountPlacement === 'bottom' ? (
            <Text className="mt-2 text-right text-xs font-medium text-textMuted dark:text-dark-textMuted">
              {countLabel}
            </Text>
          ) : null}
        </View>

        {hasError ? (
          <View className="mt-1.5 flex-row items-center px-1">
            <AlertCircle
              size={13}
              color={theme === 'dark' ? Colors.dark.error : Colors.light.error}
              strokeWidth={2.2}
            />
            <Text className="ml-1 text-xs font-medium text-error dark:text-dark-error">{error}</Text>
          </View>
        ) : null}
        {!hasError && hint ? (
          <Text className="mt-1 px-1 text-xs text-textMuted dark:text-dark-textMuted">{hint}</Text>
        ) : null}
      </View>
    );
  }

  const underlineRowMinHeight = multiline ? 108 : compact ? 52 : 58;

  return (
    <View className={`w-full ${isMinimal ? (compact ? 'mb-3' : 'mb-6') : 'mb-5'}`}>
      {label.trim().length > 0 ? (
        <View className="mb-1.5 px-0.5">
          <Text
            className={`text-[13px] font-medium ${
              hasError
                ? 'text-error dark:text-dark-error'
                : isFocused
                  ? 'text-primary dark:text-dark-primary'
                  : 'text-textMuted dark:text-dark-textMuted'
            }`}
          >
            {label}
            {required ? <Text className="font-bold text-error dark:text-dark-error"> *</Text> : null}
          </Text>
        </View>
      ) : null}

      <View className="overflow-visible pb-2">
        <View
          className={`flex-row items-center overflow-visible ${multiline ? 'items-start pt-1' : ''}`}
          style={{ minHeight: underlineRowMinHeight }}
        >
          {Icon ? (
            <View className={`mr-2.5 ${multiline ? 'mt-1' : ''}`}>
              <Icon size={20} color={iconColor} strokeWidth={2} />
            </View>
          ) : null}

          <TextInput
            {...sharedInputProps}
            className="flex-1 border-0 bg-transparent font-normal text-textPrimary dark:text-dark-textPrimary outline-none"
            style={[
              multiline
                ? multilineInputStyle(underlineFontSize)
                : singleLineInputStyle(underlineFontSize),
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
                strokeWidth={2.5}
              />
            </Pressable>
          ) : null}
        </View>

        <View
          className={`mt-1 h-[1.5px] w-full rounded-full ${
            hasError
              ? 'bg-error dark:bg-dark-error'
              : isFocused
                ? 'bg-primary dark:bg-dark-primary'
                : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />
        {countLabel ? (
          <Text
            className={`mt-2 text-xs font-medium text-textMuted dark:text-dark-textMuted ${
              centerAlign ? 'text-center' : 'text-right'
            }`}
          >
            {countLabel}
          </Text>
        ) : null}
      </View>

      {hasError ? (
        <View className="mt-1.5 flex-row items-center px-1">
          <AlertCircle
            size={13}
            color={theme === 'dark' ? Colors.dark.error : Colors.light.error}
            strokeWidth={2.2}
          />
          <Text className="ml-1 text-xs font-medium text-error dark:text-dark-error">{error}</Text>
        </View>
      ) : null}

      {!hasError && hint ? (
        <Text className="mt-1 px-1 text-xs text-textMuted dark:text-dark-textMuted">{hint}</Text>
      ) : null}
    </View>
  );
}
