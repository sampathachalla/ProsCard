import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { Platform, StyleSheet, Text as NativeText } from 'react-native';

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

const WEB_FIT_STEP = 0.02;

/**
 * Browsers ignore adjustsFontSizeToFit, so long text would end in "…" on the share page while the
 * phone shrinks it. This applies the same shrink on web, down to the same minimumFontScale.
 */
function WebFitText(props: ComponentProps<typeof NativeText>) {
  const { minimumFontScale = 0.72, style } = props;
  const explicitFontSize = StyleSheet.flatten(style)?.fontSize;
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const fit = () => {
      if (typeof explicitFontSize !== 'number') element.style.fontSize = '';
      const base = typeof explicitFontSize === 'number'
        ? explicitFontSize
        : parseFloat(getComputedStyle(element).fontSize);
      for (let scale = 1; scale >= minimumFontScale; scale -= WEB_FIT_STEP) {
        element.style.fontSize = `${base * scale}px`;
        if (element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight + 1) break;
      }
    };
    fit();
    let lastWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === lastWidth) return;
      lastWidth = element.clientWidth;
      fit();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [explicitFontSize, minimumFontScale, props.children]);

  return <NativeText ref={ref as never} {...props} />;
}

export function Text({ variant = 'body', className = '', maxFontSizeMultiplier = MAX_FONT_SCALE, ...props }: TextProps) {
  const TextComponent = Platform.OS === 'web' && props.adjustsFontSizeToFit ? WebFitText : NativeText;
  return (
    <TextComponent className={`${variantClasses[variant]} ${className}`} maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />
  );
}

