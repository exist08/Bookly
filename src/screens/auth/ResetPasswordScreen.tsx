import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BackHeader } from '../../components/Header';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { useThemeColors } from '../../theme/ThemeProvider';
import { resetPassword } from '../../data/api';
import type { RootScreenProps } from '../../navigation/types';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) {
    s++;
  }
  if (/\d/.test(pw)) {
    s++;
  }
  if (/[A-Z]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) {
    s++;
  }
  if (pw.length >= 12) {
    s++;
  }
  return s;
}

export function ResetPasswordScreen({ navigation, route }: RootScreenProps<'ResetPassword'>) {
  const { theme } = useThemeColors();
  const { email } = route.params;
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const reset = useMutation({ mutationFn: () => resetPassword(email, pw) });
  const s = strength(pw);
  const mismatch = confirm.length > 0 && confirm !== pw;
  const ok = pw.length >= 8 && confirm === pw;

  const submit = () =>
    reset.mutate(undefined, {
      onSuccess: () => {
        toast.success('Password updated. Sign in with your new one.');
        navigation.popTo('Auth', { mode: 'signin' });
      },
      onError: e => toast.error((e as Error).message),
    });

  const label = ['Too short', 'Weak', 'Okay', 'Strong', 'Very strong'][s];

  return (
    <ScreenLayout>
      <BackHeader />
      <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="display">
          Set a new <Em>password.</Em>
        </AppText>
        <AppText variant="body" tone="muted" style={styles.lede}>
          For {email}. You’ll be signed out on your other devices.
        </AppText>
        <TextField label="New password" value={pw} onChangeText={setPw} secureToggle autoComplete="new-password" textContentType="newPassword" />
        <View style={styles.meter}>
          <View style={styles.bars}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.bar, { backgroundColor: i < s ? theme.success : theme.border }]} />
            ))}
          </View>
          {pw ? (
            <View style={styles.meterLabel}>
              {s >= 3 ? <Icon name="check" size={16} color={theme.success} strokeWidth={2} /> : null}
              <AppText variant="label" color={s >= 3 ? theme.success : theme.textSubtle}>
                {label} · 8+ characters with a number
              </AppText>
            </View>
          ) : null}
        </View>
        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureToggle
          error={mismatch ? 'Passwords don’t match.' : null}
          returnKeyType="done"
          onSubmitEditing={() => ok && submit()}
        />
        <Button label="Update password" onPress={submit} disabled={!ok} loading={reset.isPending} style={styles.cta} />
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32, gap: 10 },
  lede: { marginBottom: 18 },
  meter: { gap: 8, marginBottom: 8 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  meterLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cta: { marginTop: 18 },
});
