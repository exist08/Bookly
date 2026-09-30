import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText } from '../../components/AppText';
import { Wordmark } from '../../components/Wordmark';
import { useThemeColors } from '../../theme/ThemeProvider';

const SPINES = [
  { w: 14, h: 58, c: '#D9B26A' },
  { w: 18, h: 72, c: '#F1E4C3' },
  { w: 12, h: 50, c: '#C8553A' },
  { w: 16, h: 64, c: '#8FA89A' },
];

/** In-app launch screen shown after the native splash while fonts, storage and the session settle. */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const { theme } = useThemeColors();
  const lean = useSharedValue(0);
  const leanStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${lean.value}deg` }] }));

  useEffect(() => {
    lean.value = withDelay(520, withSpring(14, { damping: 7, stiffness: 120 }));
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [lean, onDone]);

  return (
    <ScreenLayout backgroundColor={theme.splash} barStyle="light">
      <View style={styles.center}>
        <View style={styles.shelf}>
          {SPINES.map((s, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 70).springify().damping(14)}
              style={{ width: s.w, height: s.h, backgroundColor: s.c, borderRadius: 2 }}
            />
          ))}
          <Animated.View entering={FadeInDown.delay(300).springify().damping(14)} style={styles.leanWrap}>
            <Animated.View style={[styles.lean, leanStyle]} />
          </Animated.View>
        </View>
        <Animated.View entering={FadeIn.delay(380).duration(500)}>
          <Wordmark size={58} color="#FAF7F0" dot="#D9B26A" />
        </Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(700).duration(500)}>
        <AppText variant="overline" color="#B8AE9C" center style={styles.tagline}>
          A reading room for everyone
        </AppText>
      </Animated.View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  shelf: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: '#5E574C' },
  leanWrap: { width: 16, height: 62, marginLeft: 2 },
  lean: { width: 16, height: 62, backgroundColor: '#D9B26A', borderRadius: 2, transformOrigin: 'bottom left' },
  tagline: { marginBottom: 40, letterSpacing: 2.6 },
});
