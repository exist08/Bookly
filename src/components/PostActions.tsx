import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { navigationRef } from '../navigation/ref';
import { toast } from 'sonner-native';
import { AppText } from './AppText';
import { BookCover } from './BookCover';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon, type IconName } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';
import { useDeletePost } from '../hooks/queries';
import { useSession } from '../store/session';
import { sharePost } from '../utils/share';
import { compactNumber, timeAgoLong } from '../utils/format';
import type { PostView } from '../types/models';

interface Ctx {
  open: (post: PostView, opts?: { onDeleted?: () => void }) => void;
}

const PostActionsContext = createContext<Ctx>({ open: () => {} });
export const usePostActions = () => useContext(PostActionsContext);

/**
 * One bottom sheet for every post's "…" menu. Owners get Edit / Share /
 * Delete (with a confirm dialog); everyone else gets Share / View profile.
 */
export function PostActionsProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeColors();
  const { userId } = useSession();
  const navigation = navigationRef;
  const sheet = useRef<TrueSheet>(null);
  const [post, setPost] = useState<PostView | null>(null);
  const [confirming, setConfirming] = useState(false);
  const onDeletedRef = useRef<(() => void) | undefined>(undefined);
  const del = useDeletePost();

  const open = useCallback<Ctx['open']>((p, opts) => {
    setPost(p);
    onDeletedRef.current = opts?.onDeleted;
    requestAnimationFrame(() => sheet.current?.present());
  }, []);

  const value = useMemo(() => ({ open }), [open]);
  const mine = !!post && post.authorId === userId;

  const close = () => sheet.current?.dismiss();

  const run = async (fn: () => void) => {
    await close();
    fn();
  };

  const confirmDelete = () => {
    if (!post) {
      return;
    }
    del.mutate(post, {
      onSuccess: () => {
        setConfirming(false);
        toast.success('Post deleted');
        onDeletedRef.current?.();
      },
      onError: e => toast.error((e as Error).message),
    });
  };

  return (
    <PostActionsContext.Provider value={value}>
      {children}
      <TrueSheet
        ref={sheet}
        detents={['auto']}
        cornerRadius={28}
        backgroundColor={theme.background}
        grabber
        dimmed>
        {post ? (
          <View style={styles.sheet}>
            <View style={[styles.summary, { borderBottomColor: theme.border }]}>
              <BookCover title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width={52} />
              <View style={styles.summaryText}>
                <AppText variant="heading" numberOfLines={1}>
                  {post.bookTitle}
                </AppText>
                <AppText variant="caption" tone="subtle">
                  {mine ? 'Your post' : post.author.displayName} · {timeAgoLong(post.createdAt)} · {compactNumber(post.upvotes)} upvotes
                </AppText>
              </View>
            </View>
            <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {mine ? (
                <Row icon="edit" label="Edit post" onPress={() => run(() => navigation.navigate('Compose', { postId: post.id }))} divider />
              ) : null}
              <Row icon="share" label="Share post" onPress={() => run(() => sharePost(post))} divider={!mine} />
              {!mine ? (
                <Row icon="user" label={`View ${post.author.displayName.split(' ')[0]}’s shelf`} onPress={() => run(() => navigation.navigate('UserProfile', { userId: post.authorId }))} />
              ) : null}
            </View>
            {mine ? (
              <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Row icon="trash" label="Delete post" danger onPress={() => run(() => setConfirming(true))} />
              </View>
            ) : null}
            <Button label="Cancel" variant="soft" size="md" onPress={close} />
          </View>
        ) : null}
      </TrueSheet>
      <ConfirmDialog
        visible={confirming}
        title="Delete this post?"
        message={post ? `Your post on ${post.bookTitle} and its ${post.upvotes} upvotes will be removed for everyone. This can’t be undone.` : ''}
        confirmLabel="Delete post"
        cancelLabel="Keep it"
        destructive
        loading={del.isPending}
        art={
          post ? (
            <View style={styles.art}>
              <BookCover title={post.bookTitle} author={post.bookAuthor} uri={post.coverUri} palette={post.coverPalette} width={72} />
              <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
                <Icon name="trash" size={16} color="#FFFFFF" />
              </View>
            </View>
          ) : null
        }
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </PostActionsContext.Provider>
  );
}

function Row({ icon, label, onPress, danger, divider }: { icon: IconName; label: string; onPress: () => void; danger?: boolean; divider?: boolean }) {
  const { theme } = useThemeColors();
  const color = danger ? theme.danger : theme.text;
  return (
    <Tappable
      scaleTo={0.98}
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.row, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <Icon name={icon} size={20} color={color} />
      <AppText variant="bodyStrong" color={color}>
        {label}
      </AppText>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 34, gap: 14 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 8, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryText: { flex: 1, gap: 3 },
  group: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { minHeight: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  art: { marginBottom: 6 },
  badge: { position: 'absolute', right: -14, bottom: -10, width: 36, height: 36, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
