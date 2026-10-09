import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText } from '../../components/AppText';
import { Avatar } from '../../components/Avatar';
import { BookCover } from '../../components/BookCover';
import { Button, IconButton } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { VotePill } from '../../components/VotePill';
import { TransitionScope } from '../../components/TabScene';
import { usePostActions } from '../../components/PostActions';
import { useThemeColors } from '../../theme/ThemeProvider';
import { usePost, useUserPosts } from '../../hooks/queries';
import { useSession } from '../../store/session';
import { sharePost } from '../../utils/share';
import { timeAgoLong } from '../../utils/format';
import type { RootScreenProps } from '../../navigation/types';

/** Pull the first sentence out as a serif pull-quote when the review is long enough to carry one. */
function splitReview(review: string) {
  const m = review.match(/^(.{20,160}?[.!?…”])\s+([\s\S]+)$/);
  if (!m || review.length < 140) {
    return { quote: null, rest: review };
  }
  return { quote: m[1], rest: m[2] };
}

export function PostDetailScreen({
  navigation,
  route,
}: RootScreenProps<'PostDetail'>) {
  const { postId, tag, post: initial } = route.params;
  const { theme, isDarkMode } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { userId } = useSession();
  const actions = usePostActions();
  const { data: post, isError, error } = usePost(postId, initial);
  const more = useUserPosts(post?.authorId);

  const coverTag = tag ?? `feed-cover-${postId}`;
  const others = useMemo(
    () =>
      (more.data?.pages.flatMap(p => p.items) ?? [])
        .filter(p => p.id !== postId)
        .slice(0, 8),
    [more.data, postId],
  );

  if (!post) {
    return (
      <ScreenLayout>
        <View style={styles.missing}>
          <AppText variant="title" center>
            {isError ? 'This post is gone.' : 'Opening…'}
          </AppText>
          {isError ? (
            <>
              <AppText variant="small" tone="muted" center>
                {(error as Error).message}
              </AppText>
              <Button
                label="Go back"
                variant="secondary"
                size="md"
                onPress={() => navigation.goBack()}
              />
            </>
          ) : null}
        </View>
      </ScreenLayout>
    );
  }

  const { quote, rest } = splitReview(post.review);
  const mine = post.authorId === userId;
  const first = post.author.displayName.split(' ')[0];
  const ring = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(27,24,20,0.08)';

  return (
    <TransitionScope>
      <ScreenLayout hideTopPadding hideBottomPadding>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.hero,
              { paddingTop: insets.top + 64, backgroundColor: theme.stage },
            ]}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: post.coverPalette.bg,
                  opacity: isDarkMode ? 0.16 : 0.12,
                },
              ]}
            />
            <View style={[styles.ring, styles.ringA, { borderColor: ring }]} />
            <View style={[styles.ring, styles.ringB, { borderColor: ring }]} />
            <BookCover
              tag={coverTag}
              title={post.bookTitle}
              author={post.bookAuthor}
              uri={post.coverUri}
              palette={post.coverPalette}
              width={200}
              elevation="high"
            />
          </View>

          <Animated.View
            entering={FadeInDown.delay(180).springify().damping(18)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <VotePill post={post} />
            <Button
              label="Share post"
              icon="share"
              size="sm"
              onPress={() => sharePost(post)}
              style={styles.shareBtn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(240).duration(420)}
            style={styles.titleBlock}
          >
            {post.bookAuthor ? (
              <AppText variant="overline" tone="subtle">
                {post.bookAuthor}
              </AppText>
            ) : null}
            <AppText variant="hero">{post.bookTitle}</AppText>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300)}>
            <Tappable
              scaleTo={0.99}
              onPress={() =>
                navigation.push('UserProfile', { userId: post.authorId })
              }
              accessibilityLabel={`${post.author.displayName}, view shelf`}
              style={[styles.reader, { borderColor: theme.border }]}
            >
              <Avatar user={post.author} size={40} />
              <View style={styles.readerText}>
                <AppText variant="smallStrong">
                  {mine ? 'You' : post.author.displayName}
                </AppText>
                <AppText variant="caption" tone="subtle">
                  Finished it · shared {timeAgoLong(post.createdAt)}
                  {post.updatedAt !== post.createdAt ? ' · edited' : ''}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={theme.textSubtle} />
            </Tappable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(340).duration(420)}
            style={styles.review}
          >
            {quote ? <AppText variant="serifBody">{quote}</AppText> : null}
            {rest.split(/\n{2,}/).map((para, i) => (
              <AppText
                key={i}
                variant="body"
                tone="secondary"
                style={styles.para}
              >
                {para}
              </AppText>
            ))}
          </Animated.View>

          {others.length ? (
            <View style={styles.more}>
              <View style={styles.moreHead}>
                <AppText variant="heading">
                  {mine ? 'More from your shelf' : `More from ${first}`}
                </AppText>
                <Tappable
                  onPress={() =>
                    navigation.push('UserProfile', { userId: post.authorId })
                  }
                  style={styles.seeAll}
                >
                  <AppText variant="smallStrong" color={theme.accentText}>
                    See shelf
                  </AppText>
                </Tappable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moreRow}
              >
                {others.map(p => {
                  const t = `more-${postId}-${p.id}`;
                  return (
                    <Tappable
                      key={p.id}
                      scaleTo={0.95}
                      onPress={() =>
                        navigation.push('PostDetail', {
                          postId: p.id,
                          tag: t,
                          post: p,
                        })
                      }
                      accessibilityLabel={`Open ${p.bookTitle}`}
                      style={styles.moreItem}
                    >
                      <BookCover
                        tag={t}
                        title={p.bookTitle}
                        author={p.bookAuthor}
                        uri={p.coverUri}
                        palette={p.coverPalette}
                        width={104}
                      />
                      <AppText
                        variant="label"
                        numberOfLines={2}
                        style={styles.moreTitle}
                      >
                        {p.bookTitle}
                      </AppText>
                    </Tappable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[styles.topBar, { top: insets.top + 8 }]}
          pointerEvents="box-none"
        >
          <IconButton
            icon="back"
            label="Back"
            background={theme.tabBar}
            onPress={() => navigation.goBack()}
          />
          <IconButton
            icon="more"
            label="More options"
            background={theme.tabBar}
            onPress={() =>
              actions.open(post, { onDeleted: () => navigation.goBack() })
            }
          />
        </View>
      </ScreenLayout>
    </TransitionScope>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  hero: { alignItems: 'center', paddingBottom: 48, overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1, alignSelf: 'center' },
  ringA: { width: 340, height: 340, borderRadius: 170, top: 120 },
  ringB: { width: 270, height: 270, borderRadius: 135, top: 155 },
  topBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    marginTop: -24,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 10px 30px -18px rgba(20,16,10,0.35)',
  },
  shareBtn: { height: 44 },
  titleBlock: { paddingHorizontal: 24, paddingTop: 28, gap: 6 },
  reader: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readerText: { flex: 1, gap: 1 },
  review: { paddingHorizontal: 24, paddingTop: 22, gap: 14 },
  para: { lineHeight: 26 },
  more: { paddingTop: 36, gap: 14 },
  moreHead: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: { minHeight: 44, justifyContent: 'center' },
  moreRow: { paddingHorizontal: 24, gap: 14 },
  moreItem: { width: 104, gap: 8 },
  moreTitle: { lineHeight: 17 },
});
