import type { ComponentProps } from 'react';
import { Text as NativeText } from 'react-native';

type TextVariant =
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'muted'
  | 'tiny'
  | 'none';

type TextProps = ComponentProps<typeof NativeText> & {
  /** Use `none` when `className` sets font size (avoids `text-base` fighting `text-5xl`, etc.). */
  variant?: TextVariant;
  className?: string;
};

const variantClasses: Record<TextVariant, string> = {
  none: '',
  title: 'text-3xl font-extrabold tracking-tight text-textPrimary dark:text-dark-textPrimary',
  heading: 'text-xl font-bold tracking-tight text-textPrimary dark:text-dark-textPrimary',
  subtitle: 'text-lg font-semibold text-textPrimary dark:text-dark-textPrimary',
  body: 'text-base font-normal text-textPrimary dark:text-dark-textPrimary',
  caption: 'text-sm font-medium text-textPrimary dark:text-dark-textPrimary',
  muted: 'text-sm font-normal text-textMuted dark:text-dark-textMuted',
  tiny: 'text-xs font-medium text-textMuted dark:text-dark-textMuted',
};

/**
 * Largest growth allowed from the phone's text-size setting. Text still gets bigger for users who need
 * it, but stops before it overflows fixed-size areas like business-card faces and buttons.
 */
export const MAX_FONT_SCALE = 1.35;

export function Text({ variant = 'body', className = '', maxFontSizeMultiplier = MAX_FONT_SCALE, ...props }: TextProps) {
  return (
    <NativeText className={`${variantClasses[variant]} ${className}`} maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />
  );
}

