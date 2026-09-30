import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from './AppText';
import { BookCover } from './BookCover';
import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';
import { compactNumber } from '../utils/format';
import type { PostView } from '../types/models';

const GAP = 14;
const PAD = 24;

/** Three-column bookshelf used on profiles. `scope` keeps transition tags unique per screen. */
export function ShelfGrid({ posts, scope, onMore }: { posts: PostView[]; scope: string; onMore?: (p: PostView) => void }) {
  const { width } = useWindowDimensions();
  const { theme } = useThemeColors();
  const navigation = useNavigation();
  const coverW = Math.floor((width - PAD * 2 - GAP * 2) / 3);
  return (
    <View style={styles.grid}>
      {posts.map(p => {
        const tag = `${scope}-cover-${p.id}`;
        return (
          <View key={p.id} style={[styles.cell, { width: coverW }]}>
            <Tappable
              scaleTo={0.95}
              accessibilityLabel={`Open ${p.bookTitle}`}
              onPress={() => navigation.navigate('PostDetail', { postId: p.id, tag, post: p })}>
              <BookCover tag={tag} title={p.bookTitle} author={p.bookAuthor} uri={p.coverUri} palette={p.coverPalette} width={coverW} />
            </Tappable>
            <View style={styles.meta}>
              <View style={styles.votes}>
                <Icon name="upvote" size={13} color={theme.accent} filled />
                <AppText variant="caption" tone="muted" style={styles.bold}>
                  {compactNumber(p.upvotes)}
                </AppText>
              </View>
              {onMore ? (
                <Tappable onPress={() => onMore(p)} accessibilityLabel={`Manage ${p.bookTitle}`} style={styles.more} scaleTo={0.85}>
                  <Icon name="more" size={18} color={theme.textMuted} />
                </Tappable>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: PAD, flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: 20 },
  cell: { gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 },
  votes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bold: { fontVariant: ['tabular-nums'] },
  more: { width: 36, height: 32, alignItems: 'flex-end', justifyContent: 'center' },
});
