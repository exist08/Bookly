import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useThemeColors } from '../theme/ThemeProvider';
import type { Palette } from '../constants/Colors';

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'heading'
  | 'serifBody'
  | 'body'
  | 'bodyStrong'
  | 'small'
  | 'smallStrong'
  | 'caption'
  | 'label'
  | 'overline'
  | 'button';

const variants: Record<TextVariant, TextStyle> = {
  hero: { fontFamily: Fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: -0.6 },
  display: { fontFamily: Fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -0.4 },
  title: { fontFamily: Fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: Fonts.display, fontSize: 24, lineHeight: 29 },
  serifBody: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 29 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 25 },
  bodyStrong: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  smallStrong: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: Fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.6, textTransform: 'uppercase' },
  button: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 20 },
};

type Tone = 'default' | 'secondary' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'inverse';

const toneColor = (t: Palette, tone: Tone) =>
  ({
    default: t.text,
    secondary: t.textSecondary,
    muted: t.textMuted,
    subtle: t.textSubtle,
    accent: t.accentText,
    danger: t.danger,
    success: t.success,
    inverse: t.onInverse,
  }[tone]);

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: Tone;
  italic?: boolean;
  center?: boolean;
  color?: string;
}

export function AppText({ variant = 'body', tone = 'default', italic, center, color, style, ...rest }: AppTextProps) {
  const { theme } = useThemeColors();
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        variants[variant],
        { color: color ?? toneColor(theme, tone) },
        italic && { fontFamily: Fonts.displayItalic },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}

/** Inline italic run inside a serif heading, e.g. “Share what you <Em>finish.</Em>” */
export function Em({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: Fonts.displayItalic }}>{children}</Text>;
}
