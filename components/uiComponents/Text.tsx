import type { ComponentProps } from 'react';
import { Text as NativeText } from 'react-native';

type TextVariant = 'title' | 'heading' | 'subtitle' | 'body' | 'caption' | 'muted' | 'tiny';

type TextProps = ComponentProps<typeof NativeText> & {
  variant?: TextVariant;
  className?: string;
};

const variantClasses: Record<TextVariant, string> = {
  title: 'text-3xl font-extrabold tracking-tight text-textPrimary dark:text-dark-textPrimary',
  heading: 'text-xl font-bold tracking-tight text-textPrimary dark:text-dark-textPrimary',
  subtitle: 'text-lg font-semibold text-textPrimary dark:text-dark-textPrimary',
  body: 'text-base font-normal text-textPrimary dark:text-dark-textPrimary',
  caption: 'text-sm font-medium text-textPrimary dark:text-dark-textPrimary',
  muted: 'text-sm font-normal text-textMuted dark:text-dark-textMuted',
  tiny: 'text-xs font-medium text-textMuted dark:text-dark-textMuted',
};

export function Text({ variant = 'body', className = '', ...props }: TextProps) {
  return <NativeText className={`${variantClasses[variant]} ${className}`} {...props} />;
}

