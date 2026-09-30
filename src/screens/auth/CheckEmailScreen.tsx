import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BackHeader } from '../../components/Header';
import { Button } from '../../components/Button';
import { Tappable } from '../../components/Tappable';
import { useThemeColors } from '../../theme/ThemeProvider';
import { requestPasswordReset } from '../../data/api';
import type { RootScreenProps } from '../../navigation/types';

const RESEND_AFTER = 45;

export function CheckEmailScreen({ navigation, route }: RootScreenProps<'CheckEmail'>) {
  const { theme } = useThemeColors();
  const { email } = route.params;
  const [left, setLeft] = useState(RESEND_AFTER);

  useEffect(() => {
    if (left <= 0) {
      return;
    }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const openMail = () => {
    const url = Platform.OS === 'ios' ? 'message://' : 'mailto:';
    Linking.openURL(url).catch(() => toast('Open your email app to find the link'));
  };

  const resend = async () => {
    await requestPasswordReset(email);
    toast.success('Sent another link');
    setLeft(RESEND_AFTER);
  };

  return (
    <ScreenLayout>
      <BackHeader />
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.envelope}>
          <View style={[styles.letter, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.lineA, { backgroundColor: theme.borderStrong }]} />
            <View style={[styles.lineB, { backgroundColor: theme.border }]} />
            <View style={[styles.btn, { backgroundColor: theme.inverse }]} />
          </View>
          <View style={styles.pocket} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150)} style={styles.copy}>
          <AppText variant="display" center>
            Check your <Em>inbox.</Em>
          </AppText>
          <AppText variant="body" tone="muted" center>
            We sent a reset link to{'\n'}
            <AppText variant="bodyStrong">{email}</AppText>. It expires in 30 minutes.
          </AppText>
        </Animated.View>
      </View>
      <View style={styles.actions}>
        <Button label="Open email app" icon="mail" onPress={openMail} />
        {left > 0 ? (
          <AppText variant="small" tone="subtle" center style={styles.resend}>
            Didn’t get it? Resend in 0:{String(left).padStart(2, '0')}
          </AppText>
        ) : (
          <Tappable onPress={resend} style={styles.resendBtn} accessibilityLabel="Resend link">
            <AppText variant="smallStrong" color={theme.accentText}>
              Resend link
            </AppText>
          </Tappable>
        )}
        {__DEV__ ? (
          <Button
            label="Open reset link (demo)"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate('ResetPassword', { email })}
          />
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 28 },
  envelope: { width: 168, height: 128 },
  letter: { position: 'absolute', left: 14, top: 0, width: 140, height: 96, borderRadius: 8, borderWidth: 1, padding: 16, gap: 8, transform: [{ rotate: '-6deg' }] },
  lineA: { width: '70%', height: 6, borderRadius: 3 },
  lineB: { width: '90%', height: 6, borderRadius: 3 },
  btn: { width: '50%', height: 18, borderRadius: 9, marginTop: 6 },
  pocket: { position: 'absolute', left: 0, bottom: 0, width: 168, height: 84, borderRadius: 10, backgroundColor: '#D9B26A' },
  copy: { gap: 14 },
  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 6 },
  resend: { paddingVertical: 12 },
  resendBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
