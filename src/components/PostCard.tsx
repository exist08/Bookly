import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { BookCover } from './BookCover';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { VotePill } from './VotePill';
import { usePostActions } from './PostActions';
import { useThemeColors } from '../theme/ThemeProvider';
import { sharePost } from '../utils/share';
import { timeAgo } from '../utils/format';
import type { PostView } from '../types/models';

export const feedCoverTag = (id: string) => `feed-cover-${id}`;

function PostCardImpl({ post }: { post: PostView }) {
  const { theme } = useThemeColors();
  const navigation = useNavigation();
  const actions = usePostActions();
  const tag = feedCoverTag(post.id);
  const openDetail = () => navigation.navigate('PostDetail', { postId: post.id, tag, post });

  return (
    <View style={[styles.card, { borderBottomColor: theme.border }]}>
      <View style={styles.header}>
        <Tappable
          scaleTo={0.98}
          style={styles.author}
          onPress={() => navigation.navigate('UserProfile', { userId: post.authorId })}
          accessibilityLabel={`${post.author.displayName}, view shelf`}>
          <Avatar user={post.author} size={38} />
          <View>
            <AppText variant="smallStrong">{post.author.displayName}</AppText>
            <AppText variant="caption" tone="subtle">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </AppText>
          </View>
        </Tappable>
        <IconButton icon="more" label="More options" color={theme.textMuted} onPress={() => actions.open(post)} />
      </View>

      <Tappable scaleTo={0.985} onPress={openDetail} accessibilityLabel={`Open ${post.bookTitle}`} style={[styles.stage, { backgroundColor: theme.stage }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: post.coverPalette.bg, opacity: 0.1 }]} />
        <View style={[styles.floor, { backgroundColor: theme.text, opacity: 0.04 }]} />
        <BookCover
          tag={tag}
          title={post.bookTitle}
          author={post.bookAuthor}
          uri={post.coverUri}
          palette={post.coverPalette}
          width={180}
          elevation="high"
        />
      </Tappable>

      <View style={styles.actions}>
        <VotePill post={post} />
        <Tappable
          onPress={() => sharePost(post)}
          accessibilityLabel={`Share ${post.bookTitle}`}
          style={[styles.share, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}>
          <Icon name="share" size={18} />
          <AppText variant="smallStrong">Share</AppText>
        </Tappable>
      </View>

      <Tappable scaleTo={0.99} onPress={openDetail} style={styles.text} accessibilityLabel={`Read review of ${post.bookTitle}`}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.title}>
            {post.bookTitle}
          </AppText>
          {post.bookAuthor ? (
            <AppText variant="overline" tone="subtle">
              {post.bookAuthor}
            </AppText>
          ) : null}
        </View>
        <AppText variant="body" tone="secondary" numberOfLines={3}>
          {post.review}
        </AppText>
      </Tappable>
    </View>
  );
}

export const PostCard = memo(PostCardImpl);

const styles = StyleSheet.create({
  card: { paddingTop: 16, paddingBottom: 26, gap: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  header: { paddingLeft: 20, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, flex: 1 },
  stage: { marginHorizontal: 20, height: 340, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 },
  actions: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  share: { height: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth * 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { paddingHorizontal: 20, gap: 8 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 10, rowGap: 2 },
  title: { flexShrink: 1 },
});
