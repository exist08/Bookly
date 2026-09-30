import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedTransition } from 'react-native-reanimated';
import { Fonts } from '../theme/fonts';
import type { CoverPalette } from '../types/models';

/**
 * Shared-element transition used for every cover → book-detail hop.
 * A spring reads more "physical" for a book being lifted off the shelf.
 */
export const coverTransition = SharedTransition.duration(520).springify();

interface Props {
  title: string;
  author?: string | null;
  uri?: string | null;
  palette: CoverPalette;
  width: number;
  /** sharedTransitionTag; must be unique on screen and match the destination. */
  tag?: string;
  elevation?: 'none' | 'low' | 'high';
}

const shadows = {
  none: undefined,
  low: '0px 10px 18px -10px rgba(20,16,10,0.55)',
  high: '0px 26px 38px -16px rgba(20,16,10,0.6)',
};

/**
 * A book cover: the reader's photo when there is one, otherwise a generated
 * typographic cover in the post's palette.
 */
export function BookCover({ title, author, uri, palette, width, tag, elevation = 'low' }: Props) {
  const height = Math.round(width * 1.5);
  const inset = Math.round(width * 0.045);
  const pad = Math.round(width * 0.09);
  const titleSize = Math.round(width * (title.length > 11 ? 0.125 : 0.15));
  const authorSize = Math.max(6, Math.round(width * 0.05));
  return (
    <Animated.View
      sharedTransitionTag={tag}
      sharedTransitionStyle={tag ? coverTransition : undefined}
      style={[
        styles.cover,
        { width, height, backgroundColor: palette.bg, boxShadow: shadows[elevation] },
      ]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <>
          <View style={[styles.frame, { top: inset, left: inset, right: inset, bottom: inset, borderColor: palette.fg }]} />
          <View style={[styles.content, { top: pad, left: pad, right: pad, bottom: pad }]}>
            {author ? (
              <Text
                numberOfLines={1}
                style={[styles.author, { color: palette.fg, fontSize: authorSize, letterSpacing: authorSize * 0.16 }]}>
                {author.toUpperCase()}
              </Text>
            ) : (
              <View />
            )}
            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              style={[styles.title, { color: palette.fg, fontSize: titleSize, lineHeight: titleSize * 1.02 }]}>
              {title}
            </Text>
            <View style={[styles.rule, { backgroundColor: palette.fg }]} />
          </View>
        </>
      )}
      <View pointerEvents="none" style={[styles.spine, { width: Math.max(4, width * 0.035) }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: { borderTopLeftRadius: 2, borderBottomLeftRadius: 2, borderTopRightRadius: 5, borderBottomRightRadius: 5, overflow: 'hidden' },
  frame: { position: 'absolute', borderWidth: StyleSheet.hairlineWidth * 2, opacity: 0.35 },
  content: { position: 'absolute', alignItems: 'center', justifyContent: 'space-between' },
  author: { fontFamily: Fonts.semibold, textAlign: 'center' },
  title: { fontFamily: Fonts.displayItalic, textAlign: 'center' },
  rule: { width: '24%', height: StyleSheet.hairlineWidth * 2, opacity: 0.7 },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.16)' },
});
