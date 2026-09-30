import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useScrollToTop } from '@react-navigation/native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { PostCardSkeleton, Pulse } from '../../components/Skeleton';
import { EmptyShelf, ErrorState } from '../../components/EmptyState';
import { TabScene } from '../../components/TabScene';
import { TAB_BAR_HEIGHT } from '../../components/TabBar';
import { Tappable } from '../../components/Tappable';
import { Wordmark } from '../../components/Wordmark';
import { useThemeColors } from '../../theme/ThemeProvider';
import { useFeed, useMe } from '../../hooks/queries';
import type { PostView } from '../../types/models';
import type { TabScreenProps } from '../../navigation/types';

export function FeedScreen({ navigation }: TabScreenProps<'Feed'>) {
  const { theme } = useThemeColors();
  const { data: me } = useMe();
  const feed = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<Animated.FlatList<PostView>>(null);
  useScrollToTop(listRef as never);

  const posts = useMemo(() => feed.data?.pages.flatMap(p => p.items) ?? [], [feed.data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await feed.refetch();
    setRefreshing(false);
  }, [feed]);

  const header = (
    <View>
      <View style={styles.top}>
        <Wordmark size={32} />
        {me ? (
          <Tappable onPress={() => navigation.navigate('Shelf')} accessibilityLabel="Your shelf" style={styles.me}>
            <Avatar user={me} size={36} />
          </Tappable>
        ) : null}
      </View>
      <View style={[styles.intro, { borderBottomColor: theme.border }]}>
        <AppText variant="heading" style={styles.introTitle}>
          Fresh off the <Em>nightstand.</Em>
        </AppText>
        <AppText variant="small" tone="muted">
          What readers finished this week
        </AppText>
      </View>
    </View>
  );

  return (
    <TabScene>
      <ScreenLayout hideBottomPadding>
        <Animated.FlatList
          ref={listRef}
          data={posts}
          keyExtractor={p => p.id}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(260)} layout={LinearTransition}>
              <PostCard post={item} />
            </Animated.View>
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            feed.isPending ? (
              <Pulse>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </Pulse>
            ) : feed.isError ? (
              <ErrorState message={(feed.error as Error).message} onRetry={() => feed.refetch()} />
            ) : (
              <EmptyShelf
                title={<>The feed is <Em>quiet.</Em></>}
                message="Be the first to share what you finished."
                actionLabel="Share a book"
                onAction={() => navigation.navigate('Compose')}
              />
            )
          }
          ListFooterComponent={
            feed.isFetchingNextPage ? (
              <Pulse>
                <PostCardSkeleton />
              </Pulse>
            ) : !feed.hasNextPage && posts.length > 0 ? (
              <AppText variant="small" tone="subtle" center style={styles.end}>
                You’re all caught up.
              </AppText>
            ) : undefined
          }
          onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
          onEndReachedThreshold={0.6}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textMuted} colors={[theme.accent]} />}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 60 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
        />
      </ScreenLayout>
    </TabScene>
  );
}

const styles = StyleSheet.create({
  top: { paddingLeft: 20, paddingRight: 12, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  me: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  introTitle: { fontSize: 26, lineHeight: 30 },
  end: { paddingVertical: 28 },
});
