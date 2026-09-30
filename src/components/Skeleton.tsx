import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useThemeColors } from '../theme/ThemeProvider';

export function SkeletonBlock({ width, height, radius = 6, alt, style }: { width: DimensionValue; height: number; radius?: number; alt?: boolean; style?: ViewStyle }) {
  const { theme } = useThemeColors();
  return <View style={[{ width, height, borderRadius: radius, backgroundColor: alt ? theme.skeletonAlt : theme.skeleton }, style]} />;
}

/** Pulsing wrapper, shared by every placeholder so they breathe together. */
export function Pulse({ children }: { children: React.ReactNode }) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.5, { duration: 750, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={style} accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      {children}
    </Animated.View>
  );
}

export function PostCardSkeleton() {
  const { theme } = useThemeColors();
  return (
    <View style={[styles.card, { borderBottomColor: theme.border }]}>
      <View style={styles.row}>
        <SkeletonBlock width={38} height={38} radius={19} />
        <View style={styles.col}>
          <SkeletonBlock width={120} height={12} />
          <SkeletonBlock width={80} height={10} alt />
        </View>
      </View>
      <View style={[styles.stage, { backgroundColor: theme.skeletonAlt }]}>
        <SkeletonBlock width={176} height={264} radius={4} />
      </View>
      <View style={styles.between}>
        <SkeletonBlock width={136} height={44} radius={22} />
        <SkeletonBlock width={96} height={44} radius={22} />
      </View>
      <SkeletonBlock width="60%" height={24} />
      <SkeletonBlock width="100%" height={12} alt />
      <SkeletonBlock width="80%" height={12} alt />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 26, gap: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  col: { gap: 6 },
  stage: { height: 340, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
});
