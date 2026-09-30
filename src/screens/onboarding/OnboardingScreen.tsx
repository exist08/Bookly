import React, { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { Avatar } from '../../components/Avatar';
import { BookCover } from '../../components/BookCover';
import { Button, IconButton } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { Wordmark } from '../../components/Wordmark';
import { useThemeColors } from '../../theme/ThemeProvider';
import { PALETTES } from '../../data/seed';
import { session } from '../../store/session';
import type { RootScreenProps } from '../../navigation/types';

type Slide = { key: string; title: React.ReactNode; body: string; tint: [string, string]; art: React.ReactNode };

function ShareArt() {
  const { theme } = useThemeColors();
  return (
    <View>
      <View style={[styles.miniCard, { backgroundColor: theme.surface }]}>
        <View style={styles.miniHead}>
          <Avatar user={{ displayName: 'You', avatarUri: null, avatarColor: '#3D5A80' }} size={28} />
          <AppText variant="label">You</AppText>
          <AppText variant="caption" tone="subtle">
            · just now
          </AppText>
        </View>
        <View style={[styles.miniStage, { backgroundColor: theme.stage }]}>
          <BookCover title="Walden" author="H. D. Thoreau" palette={PALETTES.walden} width={116} />
        </View>
        <AppText variant="heading">Walden</AppText>
        <AppText variant="caption" tone="muted">
          Two years in a cabin, and somehow it is about my phone.
        </AppText>
      </View>
      <View style={[styles.fab, { backgroundColor: theme.inverse }]}>
        <Icon name="plus" size={24} color={theme.onInverse} strokeWidth={2} />
      </View>
    </View>
  );
}

function PeopleArt() {
  const { theme } = useThemeColors();
  const items = [
    { p: PALETTES.eyre, t: 'Jane Eyre', a: 'C. Brontë', who: 'Mira', c: '#2F4A3A', r: '-6deg', y: 18 },
    { p: PALETTES.odyssey, t: 'The Odyssey', a: 'Homer', who: 'Kabir', c: '#8C5F12', r: '0deg', y: -10 },
    { p: PALETTES.little, t: 'Little Women', a: 'Alcott', who: 'Ines', c: '#6B2E3A', r: '6deg', y: 18 },
  ];
  return (
    <View style={styles.people}>
      {items.map(i => (
        <View key={i.t} style={[styles.person, { transform: [{ rotate: i.r }, { translateY: i.y }] }]}>
          <BookCover title={i.t} author={i.a} palette={i.p} width={96} />
          <View style={[styles.chip, { backgroundColor: theme.surface }]}>
            <Avatar user={{ displayName: i.who, avatarUri: null, avatarColor: i.c }} size={24} />
            <AppText variant="label">{i.who}</AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

function VoteArt() {
  const { theme } = useThemeColors();
  return (
    <View style={styles.voteArt}>
      <View style={[styles.floatL]}>
        <BookCover title="Frankenstein" author="Mary Shelley" palette={PALETTES.frank} width={92} />
      </View>
      <View style={[styles.floatR]}>
        <BookCover title="The Great Gatsby" author="Fitzgerald" palette={PALETTES.gatsby} width={92} />
      </View>
      <View style={[styles.bigPill, { backgroundColor: theme.surface }]}>
        <View style={[styles.bigUp, { backgroundColor: theme.accentSoft }]}>
          <Icon name="upvote" size={30} color={theme.accent} filled />
        </View>
        <AppText variant="display" style={styles.bigCount}>
          1.2k
        </AppText>
        <View style={styles.bigDown}>
          <Icon name="downvote" size={30} color={theme.textMuted} />
        </View>
      </View>
    </View>
  );
}

function Dot({ index, x, width }: { index: number; x: SharedValue<number>; width: number }) {
  const { theme } = useThemeColors();
  const style = useAnimatedStyle(() => {
    const p = x.value / width;
    const w = interpolate(p, [index - 1, index, index + 1], [7, 22, 7], Extrapolation.CLAMP);
    const o = interpolate(p, [index - 1, index, index + 1], [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width: w, opacity: o };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: theme.text }, style]} />;
}

function SlideView({ item, index, x, width }: { item: Slide; index: number; x: SharedValue<number>; width: number }) {
  const artStyle = useAnimatedStyle(() => {
    const p = x.value / width - index;
    return {
      opacity: interpolate(Math.abs(p), [0, 0.7], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(p, [-1, 0, 1], [width * 0.35, 0, -width * 0.35]) },
        { scale: interpolate(Math.abs(p), [0, 1], [1, 0.85], Extrapolation.CLAMP) },
      ],
    };
  });
  const { isDarkMode } = useThemeColors();
  return (
    <View style={{ width }}>
      <View style={styles.artArea}>
        <View style={[styles.halo, { backgroundColor: isDarkMode ? item.tint[1] : item.tint[0] }]} />
        <Animated.View style={artStyle}>{item.art}</Animated.View>
      </View>
      <View style={styles.copy}>
        <AppText variant="overline" tone="accent">
          0{index + 1} / 03
        </AppText>
        <AppText variant="display">{item.title}</AppText>
        <AppText variant="body" tone="muted">
          {item.body}
        </AppText>
      </View>
    </View>
  );
}

export function OnboardingScreen(_: RootScreenProps<'Onboarding'>) {
  const { theme } = useThemeColors();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const list = useRef<Animated.FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const slides: Slide[] = [
    { key: 'share', title: <>Share what you <Em>finish.</Em></>, body: 'Snap the cover, say what stayed with you. A post takes less time than the last chapter did.', tint: ['#F1E7D2', '#2A2419'], art: <ShareArt /> },
    { key: 'people', title: <>Find books through <Em>people.</Em></>, body: 'Browse the shelves of readers you trust instead of an algorithm that has never read a page.', tint: ['#E3E8E4', '#1C241F'], art: <PeopleArt /> },
    { key: 'vote', title: <>Vote the good ones <Em>up.</Em></>, body: 'Upvote the reviews that made you want the book. The best ones rise to the top of the feed.', tint: ['#F3E1D9', '#2A1D19'], art: <VoteArt /> },
  ];

  const onScroll = useAnimatedScrollHandler(e => {
    x.value = e.contentOffset.x;
  });

  const onViewable = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
    if (viewableItems[0]?.index != null) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  // Removing the Onboarding route from the stack lands the reader on Welcome.
  const finish = () => session.finishOnboarding();

  const last = index === slides.length - 1;

  return (
    <ScreenLayout>
      <View style={styles.top}>
        <Wordmark size={24} />
        {!last ? (
          <Tappable onPress={finish} style={styles.skip} accessibilityLabel="Skip introduction">
            <AppText variant="bodyStrong" tone="secondary">
              Skip
            </AppText>
          </Tappable>
        ) : null}
      </View>
      <Animated.FlatList
        ref={list}
        data={slides}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index: i }) => <SlideView item={item} index={i} x={x} width={width} />}
        style={styles.list}
      />
      <View style={styles.bottom}>
        <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of 3`}>
          {slides.map((s, i) => (
            <Dot key={s.key} index={i} x={x} width={width} />
          ))}
        </View>
        {last ? (
          <Button label="Get started" icon="arrowRight" onPress={finish} style={styles.start} />
        ) : (
          <IconButton
            icon="arrowRight"
            label="Next"
            size={60}
            iconSize={24}
            background={theme.inverse}
            color={theme.onInverse}
            onPress={() => list.current?.scrollToIndex({ index: index + 1, animated: true })}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  top: { height: 56, paddingLeft: 24, paddingRight: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skip: { height: 44, paddingHorizontal: 8, justifyContent: 'center' },
  list: { flexGrow: 0 },
  artArea: { height: 420, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 320, height: 320, borderRadius: 160 },
  copy: { paddingHorizontal: 28, gap: 14 },
  bottom: { marginTop: 'auto', paddingLeft: 28, paddingRight: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 7, borderRadius: 4 },
  start: { paddingHorizontal: 28 },
  miniCard: { width: 232, borderRadius: 22, padding: 14, gap: 10, transform: [{ rotate: '-4deg' }], boxShadow: '0px 24px 50px -24px rgba(20,16,10,0.45)' },
  miniHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniStage: { height: 200, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: -18, bottom: 30, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  people: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  person: { alignItems: 'center', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 4, paddingRight: 10, borderRadius: 999, boxShadow: '0px 6px 14px -8px rgba(20,16,10,0.4)' },
  voteArt: { width: 320, height: 320, alignItems: 'center', justifyContent: 'center' },
  floatL: { position: 'absolute', left: 26, top: 36, transform: [{ rotate: '-10deg' }] },
  floatR: { position: 'absolute', right: 24, top: 60, transform: [{ rotate: '9deg' }] },
  bigPill: { marginTop: 150, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, padding: 6, boxShadow: '0px 24px 40px -18px rgba(20,16,10,0.5)' },
  bigUp: { width: 64, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  bigCount: { minWidth: 76, textAlign: 'center' },
  bigDown: { width: 64, height: 56, alignItems: 'center', justifyContent: 'center' },
});
