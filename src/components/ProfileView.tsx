import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, Em } from './AppText';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { EmptyShelf, ErrorState } from './EmptyState';
import { ShelfGrid } from './ShelfGrid';
import { Pulse, SkeletonBlock } from './Skeleton';
import { usePostActions } from './PostActions';
import { useThemeColors } from '../theme/ThemeProvider';
import { useProfile, useUserPosts } from '../hooks/queries';
import { compactNumber } from '../utils/format';
import { shareProfile } from '../utils/share';

interface Props {
  userId: string;
  isMe: boolean;
  /** Tag prefix for this screen's covers so shared transitions stay unique. */
  scope: string;
  header: React.ReactNode;
  bottomInset: number;
  onEditProfile?: () => void;
  onCompose?: () => void;
}

export function ProfileView({ userId, isMe, scope, header, bottomInset, onEditProfile, onCompose }: Props) {
  const { theme } = useThemeColors();
  const profile = useProfile(userId);
  const posts = useUserPosts(userId);
  const actions = usePostActions();
  const [refreshing, setRefreshing] = useState(false);
  const list = useMemo(() => posts.data?.pages.flatMap(p => p.items) ?? [], [posts.data]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([profile.refetch(), posts.refetch()]);
    setRefreshing(false);
  };

  if (profile.isError) {
    return (
      <View style={styles.flex}>
        {header}
        <ErrorState message={(profile.error as Error).message} onRetry={() => profile.refetch()} />
      </View>
    );
  }

  const user = profile.data?.user;
  const stats = profile.data?.stats;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.textMuted} colors={[theme.accent]} />}>
      {header}
      {!user || !stats ? (
        <Pulse>
          <View style={styles.skeleton}>
            <SkeletonBlock width={96} height={96} radius={48} />
            <SkeletonBlock width={180} height={28} />
            <SkeletonBlock width={240} height={14} alt />
          </View>
        </Pulse>
      ) : isMe ? (
        <Animated.View entering={FadeIn} style={styles.meHead}>
          <View style={styles.meRow}>
            <Avatar user={user} size={88} />
            <View style={styles.meText}>
              <AppText variant="title">{user.displayName}</AppText>
              <AppText variant="small" tone="muted">
                <AppText variant="smallStrong">{stats.books}</AppText> books ·{' '}
                <AppText variant="smallStrong">{compactNumber(stats.upvotes)}</AppText> upvotes
              </AppText>
            </View>
          </View>
          {user.bio ? (
            <AppText variant="body" tone="secondary">
              {user.bio}
            </AppText>
          ) : null}
          <View style={styles.meActions}>
            <Button label="Edit profile" size="md" onPress={onEditProfile} style={styles.flex} />
            <Button label="Share profile" variant="secondary" size="md" onPress={() => shareProfile(user)} style={styles.flex} />
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.otherHead}>
          <Avatar user={user} size={96} ring={theme.accent} />
          <AppText variant="display" center style={styles.name}>
            {user.displayName}
          </AppText>
          {user.bio ? (
            <AppText variant="body" tone="muted" center style={styles.bio}>
              {user.bio}
            </AppText>
          ) : null}
          <View style={[styles.stats, { borderColor: theme.border }]}>
            <Stat value={String(stats.books)} label="Books shared" />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <Stat value={compactNumber(stats.upvotes)} label="Upvotes earned" />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <Stat value={String(new Date(user.createdAt).getFullYear())} label="Reading since" />
          </View>
        </Animated.View>
      )}

      <View style={[styles.shelfHead, isMe && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
        <AppText variant="title" style={styles.shelfTitle}>
          {isMe ? 'Your shelf' : 'The shelf'}
        </AppText>
        <AppText variant="caption" tone="subtle">
          {stats ? `${stats.books} book${stats.books === 1 ? '' : 's'}` : ''}
        </AppText>
      </View>

      {posts.isPending ? (
        <Pulse>
          <View style={styles.gridSkeleton}>
            {[0, 1, 2].map(i => (
              <SkeletonBlock key={i} width={100} height={150} radius={3} />
            ))}
          </View>
        </Pulse>
      ) : list.length ? (
        <ShelfGrid posts={list} scope={scope} onMore={isMe ? p => actions.open(p) : undefined} />
      ) : isMe ? (
        <EmptyShelf
          title={<>Your shelf is <Em>waiting.</Em></>}
          message="Share the last book you finished. It doesn’t have to be a classic — it just has to be yours."
          actionLabel="Share your first book"
          onAction={onCompose}
        />
      ) : (
        <EmptyShelf title="Nothing here yet." message={`${user?.displayName ?? 'This reader'} hasn’t shared a book yet.`} />
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" tone="subtle">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  skeleton: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  meHead: { paddingHorizontal: 24, paddingTop: 8, gap: 14 },
  meRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  meText: { flex: 1, gap: 6 },
  meActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  otherHead: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  name: { marginTop: 14 },
  bio: { marginTop: 8, maxWidth: 310 },
  stats: { alignSelf: 'stretch', marginTop: 22, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  shelfHead: { marginHorizontal: 24, marginTop: 26, paddingTop: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  shelfTitle: { fontSize: 26 },
  gridSkeleton: { flexDirection: 'row', gap: 14, paddingHorizontal: 24 },
});
