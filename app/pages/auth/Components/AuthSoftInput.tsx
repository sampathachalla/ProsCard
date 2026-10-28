import { useState } from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/common/ui/Text';

export interface AuthSoftInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  accessibilityLabel?: string;
  maxLength?: number;
  textContentType?: 'oneTimeCode';
  autoComplete?: 'one-time-code';
}

/** Flat filled input with external muted label above the box. */
export function AuthSoftInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  accessibilityLabel,
  maxLength,
  textContentType,
  autoComplete,
}: AuthSoftInputProps) {
  const { theme } = useThemeContext();
  const [showSecret, setShowSecret] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isSecure = secureTextEntry && !showSecret;
  return (
    <View className="mb-4 w-full">
      {label ? (
        <Text
          variant="none"
          className={`mb-2 text-[14px] font-normal ${
            error
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center rounded-lg border px-4 ${
          error
            ? 'border-red-400 bg-red-50/80 dark:border-red-500/50 dark:bg-red-950/30'
            : isFocused
              ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
              : 'border-transparent bg-slate-100 dark:bg-dark-card'
        }`}
        style={[
          { minHeight: 54 },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme === 'dark' ? '#64748b' : '#94a3b8'}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={isSecure}
          accessibilityLabel={accessibilityLabel || placeholder}
          maxLength={maxLength}
          textContentType={textContentType}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical="center"
          className="flex-1 border-0 bg-transparent text-[16px] font-normal text-textPrimary outline-none dark:text-dark-textPrimary"
          style={[
            {
              // No lineHeight — RN TextInput + lineHeight often clips descenders when focused.
              minHeight: 44,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 16,
              ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
            },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
          underlineColorAndroid="transparent"
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setShowSecret((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showSecret ? 'Hide password' : 'Show password'}
            className="p-1 active:opacity-70"
          >
            {showSecret ? (
              <EyeOff size={18} color={theme === 'dark' ? '#94a3b8' : '#64748b'} />
            ) : (
              <Eye size={18} color={theme === 'dark' ? '#94a3b8' : '#64748b'} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1.5 px-0.5 text-xs text-red-500 dark:text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
