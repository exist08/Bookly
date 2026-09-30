import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';
import { useVote } from '../hooks/queries';
import { compactNumber } from '../utils/format';
import type { PostView } from '../types/models';

export function VotePill({ post, onSurface }: { post: PostView; onSurface?: boolean }) {
  const { theme } = useThemeColors();
  const vote = useVote();
  const bump = useSharedValue(1);

  useEffect(() => {
    bump.value = withSequence(withTiming(1.18, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 260 }));
  }, [post.score, bump]);

  const countStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  const up = post.myVote === 1;
  const down = post.myVote === -1;
  const scoreColor = up ? theme.accentText : down ? theme.downvote : theme.text;

  const cast = (value: 1 | -1) => vote.mutate({ post, value: post.myVote === value ? 0 : value });

  return (
    <View style={[styles.pill, { backgroundColor: onSurface ? theme.surfaceAlt : theme.surfaceAlt }]}>
      <Tappable
        scaleTo={0.85}
        onPress={() => cast(1)}
        accessibilityLabel="Upvote"
        accessibilityState={{ selected: up }}
        style={styles.btn}>
        <Icon name="upvote" size={20} color={up ? theme.accent : theme.textMuted} filled={up} />
      </Tappable>
      <Animated.View style={countStyle}>
        <AppText
          variant="smallStrong"
          color={scoreColor}
          style={styles.count}
          accessibilityLabel={`Score ${post.score}`}>
          {compactNumber(post.score)}
        </AppText>
      </Animated.View>
      <Tappable
        scaleTo={0.85}
        onPress={() => cast(-1)}
        accessibilityLabel="Downvote"
        accessibilityState={{ selected: down }}
        style={styles.btn}>
        <Icon name="downvote" size={20} color={down ? theme.downvote : theme.textMuted} filled={down} />
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, padding: 2 },
  btn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  count: { minWidth: 36, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
