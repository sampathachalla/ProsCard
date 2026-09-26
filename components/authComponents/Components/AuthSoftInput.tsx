import { useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/components/uiComponents/Text';

export interface AuthSoftInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  accessibilityLabel?: string;
}

/** Instagram-style soft filled input — placeholder-first, no loud labels. */
export function AuthSoftInput({
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  accessibilityLabel,
}: AuthSoftInputProps) {
  const { theme } = useThemeContext();
  const [focused, setFocused] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const isSecure = secureTextEntry && !showSecret;

  return (
    <View className="mb-3 w-full">
      <View
        className={`flex-row items-center rounded-xl border px-3.5 ${
          error
            ? 'border-red-400 bg-red-50/80 dark:border-red-500/50 dark:bg-red-950/30'
            : focused
            ? 'border-sky-400 bg-white dark:border-sky-500 dark:bg-slate-900'
            : 'border-black/8 bg-[#fafafa] dark:border-white/10 dark:bg-slate-900/70'
        }`}
        style={{ minHeight: 48 }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme === 'dark' ? '#64748b' : '#a8a8a8'}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={isSecure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel || placeholder}
          className="flex-1 py-3 text-[15px] text-textPrimary dark:text-dark-textPrimary"
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
              <EyeOff size={18} color={theme === 'dark' ? '#94a3b8' : '#8e8e8e'} />
            ) : (
              <Eye size={18} color={theme === 'dark' ? '#94a3b8' : '#8e8e8e'} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1.5 px-1 text-xs text-red-500 dark:text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
