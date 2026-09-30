import React, { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/Button';
import { ModalHeader } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { UnderlineField, type TextInputRef } from '../../components/TextField';
import { chooseImage } from '../../components/AvatarPicker';
import { useThemeColors } from '../../theme/ThemeProvider';
import { Fonts } from '../../theme/fonts';
import { qk, useCreatePost, useUpdatePost } from '../../hooks/queries';
import { pickImage } from '../../utils/imagePicker';
import { compactNumber, timeAgoLong } from '../../utils/format';
import { COVER_PALETTES } from '../../data/seed';
import { ApiError } from '../../data/api';
import type { PostView } from '../../types/models';
import type { RootScreenProps } from '../../navigation/types';

const MAX = 500;

/** Share a book, or edit one (route param `postId`). Presented as a modal. */
export function ComposeScreen({ navigation, route }: RootScreenProps<'Compose'>) {
  const { theme } = useThemeColors();
  const qc = useQueryClient();
  const editing = route.params?.postId ? qc.getQueryData<PostView>(qk.post(route.params.postId)) ?? findCached(qc, route.params.postId) : undefined;
  const create = useCreatePost();
  const update = useUpdatePost();

  const [cover, setCover] = useState<string | null>(editing?.coverUri ?? null);
  const [title, setTitle] = useState(editing?.bookTitle ?? '');
  const [author, setAuthor] = useState(editing?.bookAuthor ?? '');
  const [review, setReview] = useState(editing?.review ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const authorRef = useRef<TextInputRef>(null);
  const reviewRef = useRef<TextInputRef>(null);

  const palette = useMemo(
    () => editing?.coverPalette ?? COVER_PALETTES[(title.length * 7) % COVER_PALETTES.length],
    [editing, title.length],
  );
  const dirty = editing
    ? cover !== editing.coverUri || title !== editing.bookTitle || author !== (editing.bookAuthor ?? '') || review !== editing.review
    : !!(cover || title || author || review);
  const ready = title.trim().length > 0 && review.trim().length > 0;
  const pending = create.isPending || update.isPending;

  const close = () => {
    if (!dirty || pending) {
      navigation.goBack();
      return;
    }
    Alert.alert(editing ? 'Discard changes?' : 'Discard this post?', undefined, [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const onError = (e: unknown) => {
    if (e instanceof ApiError && e.field) {
      setErrors({ [e.field]: e.message });
    } else {
      toast.error((e as Error).message);
    }
  };

  const submit = () => {
    const input = { bookTitle: title, bookAuthor: author || null, review, coverUri: cover };
    if (editing) {
      update.mutate(
        { id: editing.id, input },
        { onSuccess: () => { toast.success('Post updated'); navigation.goBack(); }, onError },
      );
    } else {
      create.mutate(input, {
        onSuccess: () => {
          toast.success('Shared to the feed');
          navigation.goBack();
        },
        onError,
      });
    }
  };

  const pick = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source, 'cover');
    if (uri) {
      setCover(uri);
    }
  };

  return (
    <ScreenLayout>
      <ModalHeader
        title={editing ? 'Edit post' : 'Share a book'}
        onLeft={close}
        rightLabel={editing ? 'Save' : 'Post'}
        onRight={submit}
        rightDisabled={!ready || (editing ? !dirty : false)}
        rightLoading={pending}
      />
      <KeyboardAwareScrollView bottomOffset={30} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.coverRow}>
          {cover || title ? (
            <Animated.View entering={ZoomIn.springify().damping(16)}>
              <Tappable
                scaleTo={0.96}
                onPress={() => chooseImage('cover', setCover, cover ? () => setCover(null) : undefined)}
                accessibilityLabel={cover ? 'Change cover' : 'Add a cover photo'}>
                <BookCover title={title || 'Untitled'} author={author} uri={cover} palette={palette} width={132} />
                <View style={[styles.coverBadge, { backgroundColor: theme.inverse, borderColor: theme.background }]}>
                  <Icon name="camera" size={18} color={theme.onInverse} />
                </View>
              </Tappable>
            </Animated.View>
          ) : (
            <Tappable
              scaleTo={0.97}
              onPress={() => pick('library')}
              accessibilityLabel="Add a book cover"
              style={[styles.dropzone, { borderColor: theme.borderDashed, backgroundColor: theme.surfaceSunken }]}>
              <View style={[styles.dropIcon, { backgroundColor: theme.surface }]}>
                <Icon name="image" size={22} />
              </View>
              <AppText variant="label">Add cover</AppText>
            </Tappable>
          )}
          <View style={styles.coverCopy}>
            {editing ? (
              <>
                <AppText variant="overline" tone="subtle">
                  Posted {timeAgoLong(editing.createdAt)}
                </AppText>
                <View style={styles.votes}>
                  <Icon name="upvote" size={16} color={theme.accent} filled />
                  <AppText variant="smallStrong">{compactNumber(editing.upvotes)} upvotes</AppText>
                </View>
                <AppText variant="caption" tone="muted">
                  Votes stay with the post when you edit it.
                </AppText>
              </>
            ) : (
              <>
                <AppText variant="heading">
                  The cover does the <Em>talking.</Em>
                </AppText>
                <AppText variant="caption" tone="muted">
                  {cover ? 'Looking sharp.' : 'Snap your copy or pick a photo. No photo? We’ll set one in type for you.'}
                </AppText>
              </>
            )}
            <View style={styles.pickers}>
              <Button label="Take photo" icon="camera" variant="secondary" size="sm" onPress={() => pick('camera')} />
              <Button label={cover ? 'Replace photo' : 'Choose photo'} icon="image" variant="secondary" size="sm" onPress={() => pick('library')} />
            </View>
          </View>
        </View>

        <View style={styles.fields}>
          <UnderlineField
            label="Book title"
            large
            value={title}
            onChangeText={t => {
              setTitle(t);
              setErrors({});
            }}
            placeholder="What did you finish?"
            returnKeyType="next"
            onSubmitEditing={() => authorRef.current?.focus()}
            error={errors.bookTitle}
            maxLength={200}
          />
          <UnderlineField
            ref={authorRef}
            label="Author"
            optional
            value={author}
            onChangeText={setAuthor}
            placeholder="Who wrote it?"
            returnKeyType="next"
            onSubmitEditing={() => reviewRef.current?.focus()}
            maxLength={120}
          />
          <View style={styles.reviewWrap}>
            <View style={styles.reviewHead}>
              <AppText variant="overline" tone="subtle">
                Your take
              </AppText>
              <AppText variant="label" color={review.length > MAX - 50 ? theme.danger : theme.textSubtle} style={styles.count}>
                {review.length} / {MAX}
              </AppText>
            </View>
            <TextInput
              ref={reviewRef}
              value={review}
              onChangeText={t => {
                setReview(t.slice(0, MAX));
                setErrors({});
              }}
              multiline
              placeholder="Why should someone else read it — or skip it?"
              placeholderTextColor={theme.placeholder}
              selectionColor={theme.accent}
              accessibilityLabel="Your take"
              style={[
                styles.review,
                { color: theme.text, backgroundColor: theme.surface, borderColor: errors.review ? theme.danger : theme.borderStrong },
              ]}
            />
            {errors.review ? (
              <AppText variant="caption" tone="danger">
                {errors.review}
              </AppText>
            ) : null}
          </View>
        </View>

        <Animated.View entering={FadeIn.delay(200)} style={styles.note}>
          <Icon name="info" size={18} color={theme.textMuted} />
          <AppText variant="caption" tone="muted" style={styles.flex}>
            Posts are public. You can edit or delete yours any time from your shelf.
          </AppText>
        </Animated.View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

function findCached(qc: ReturnType<typeof useQueryClient>, id: string): PostView | undefined {
  for (const [, data] of qc.getQueriesData<{ pages: { items: PostView[] }[] }>({ queryKey: ['userPosts'] })) {
    const hit = data?.pages.flatMap(p => p.items).find(p => p.id === id);
    if (hit) {
      return hit;
    }
  }
  for (const [, data] of qc.getQueriesData<{ pages: { items: PostView[] }[] }>({ queryKey: qk.feed })) {
    const hit = data?.pages.flatMap(p => p.items).find(p => p.id === id);
    if (hit) {
      return hit;
    }
  }
  return undefined;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  coverRow: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  dropzone: { width: 132, height: 198, borderRadius: 6, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10 },
  dropIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  coverBadge: { position: 'absolute', right: -10, bottom: -10, width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  coverCopy: { flex: 1, gap: 8, paddingTop: 4 },
  votes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickers: { gap: 8, marginTop: 6, alignItems: 'flex-start' },
  fields: { marginTop: 30, gap: 22 },
  reviewWrap: { gap: 8 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  count: { fontVariant: ['tabular-nums'] },
  review: { minHeight: 180, borderWidth: 1, borderRadius: 16, padding: 16, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 26 },
});
