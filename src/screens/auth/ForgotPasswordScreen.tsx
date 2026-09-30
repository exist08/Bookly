import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMutation } from '@tanstack/react-query';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BackHeader } from '../../components/Header';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { Tappable } from '../../components/Tappable';
import { useThemeColors } from '../../theme/ThemeProvider';
import { requestPasswordReset } from '../../data/api';
import type { RootScreenProps } from '../../navigation/types';

export function ForgotPasswordScreen({ navigation, route }: RootScreenProps<'ForgotPassword'>) {
  const { theme } = useThemeColors();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const send = useMutation({ mutationFn: requestPasswordReset });

  const submit = () =>
    send.mutate(email, { onSuccess: () => navigation.navigate('CheckEmail', { email: email.trim() }) });

  return (
    <ScreenLayout>
      <BackHeader />
      <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
          <Icon name="lock" size={26} color={theme.accentText} />
        </View>
        <AppText variant="display">
          Forgot your <Em>password?</Em>
        </AppText>
        <AppText variant="body" tone="muted" style={styles.lede}>
          Happens to the best readers. Enter your email and we’ll send you a link to set a new one.
        </AppText>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={submit}
          error={send.error ? (send.error as Error).message : null}
        />
        <Button label="Send reset link" onPress={submit} loading={send.isPending} style={styles.cta} />
        <View style={styles.row}>
          <AppText variant="small" tone="muted">
            Signed up with Google?
          </AppText>
          <Tappable onPress={() => navigation.goBack()} style={styles.link}>
            <AppText variant="smallStrong" color={theme.accentText}>
              Use Google instead
            </AppText>
          </Tappable>
        </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32, gap: 10 },
  badge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  lede: { marginBottom: 18 },
  cta: { marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 18 },
  link: { minHeight: 44, justifyContent: 'center' },
});
