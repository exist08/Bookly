import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BookCover } from '../../components/BookCover';
import { Button, GoogleButton } from '../../components/Button';
import { Tappable } from '../../components/Tappable';
import { Wordmark } from '../../components/Wordmark';
import { useThemeColors } from '../../theme/ThemeProvider';
import { PALETTES } from '../../data/seed';
import { useAuth } from '../../hooks/queries';
import type { RootScreenProps } from '../../navigation/types';

const FAN = [
  { t: 'The Odyssey', a: 'Homer', p: PALETTES.odyssey, w: 150, x: -82, y: 42, r: '-9deg', d: 120 },
  { t: 'Moby-Dick', a: 'Herman Melville', p: PALETTES.moby, w: 150, x: 82, y: 42, r: '8deg', d: 200 },
  { t: 'Middlemarch', a: 'George Eliot', p: PALETTES.middlemarch, w: 176, x: 0, y: 0, r: '0deg', d: 40 },
];

export function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const { theme, isDarkMode } = useThemeColors();
  const { google } = useAuth();

  return (
    <ScreenLayout>
      <View style={styles.top}>
        <Wordmark size={30} />
      </View>
      <View style={styles.art}>
        <View style={[styles.halo, { backgroundColor: isDarkMode ? '#2A2419' : '#F1E7D2' }]} />
        {FAN.map(b => (
          <Animated.View
            key={b.t}
            entering={FadeInDown.delay(b.d).springify().damping(15)}
            style={[styles.book, { transform: [{ translateX: b.x }, { translateY: b.y }, { rotate: b.r }] }]}>
            <BookCover title={b.t} author={b.a} palette={b.p} width={b.w} elevation="high" />
          </Animated.View>
        ))}
      </View>
      <Animated.View entering={FadeInUp.delay(260).duration(500)} style={styles.copy}>
        <AppText variant="hero">
          Books are better <Em>passed hand to hand.</Em>
        </AppText>
        <AppText variant="body" tone="muted">
          Share what you finished, find your next read through people whose taste you trust.
        </AppText>
      </Animated.View>
      <View style={styles.actions}>
        <GoogleButton
          loading={google.isPending}
          onPress={() => google.mutate(undefined, { onError: e => toast.error((e as Error).message) })}
        />
        <Button label="Continue with email" icon="mail" onPress={() => navigation.navigate('Auth', { mode: 'signup' })} />
        <View style={styles.signIn}>
          <AppText variant="small" tone="muted">
            Already a member?
          </AppText>
          <Tappable onPress={() => navigation.navigate('Auth', { mode: 'signin' })} style={styles.link} accessibilityLabel="Sign in">
            <AppText variant="smallStrong" color={theme.accentText}>
              Sign in
            </AppText>
          </Tappable>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 28, paddingTop: 12 },
  art: { height: 360, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  book: { position: 'absolute' },
  copy: { paddingHorizontal: 28, gap: 14 },
  actions: { marginTop: 'auto', paddingHorizontal: 24, paddingBottom: 12, gap: 12 },
  signIn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
});
