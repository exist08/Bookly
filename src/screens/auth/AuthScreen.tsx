import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText } from '../../components/AppText';
import { BackHeader } from '../../components/Header';
import { Button, GoogleButton } from '../../components/Button';
import { TextField, type TextInputRef } from '../../components/TextField';
import { Tappable } from '../../components/Tappable';
import { useThemeColors } from '../../theme/ThemeProvider';
import { useAuth } from '../../hooks/queries';
import { ApiError } from '../../data/api';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../data/seed';
import type { RootScreenProps } from '../../navigation/types';

type Mode = 'signin' | 'signup';
type Errors = Partial<Record<'name' | 'email' | 'password', string>>;

export function AuthScreen({ navigation, route }: RootScreenProps<'Auth'>) {
  const { theme } = useThemeColors();
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(__DEV__ && mode === 'signin' ? DEMO_EMAIL : '');
  const [password, setPassword] = useState(__DEV__ && mode === 'signin' ? DEMO_PASSWORD : '');
  const [errors, setErrors] = useState<Errors>({});
  const emailRef = useRef<TextInputRef>(null);
  const passRef = useRef<TextInputRef>(null);

  const signIn = mode === 'signin';
  const pending = auth.signIn.isPending || auth.signUp.isPending;

  const onError = (e: unknown) => {
    if (e instanceof ApiError && e.field) {
      setErrors({ [e.field]: e.message });
    } else {
      toast.error((e as Error).message);
    }
  };

  const submit = () => {
    const next: Errors = {};
    if (!signIn && !name.trim()) {
      next.name = 'Add your name.';
    }
    if (!email.trim()) {
      next.email = 'Enter your email.';
    }
    if (!password) {
      next.password = 'Enter a password.';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    if (signIn) {
      auth.signIn.mutate({ email, password }, { onError });
    } else {
      auth.signUp.mutate({ name, email, password }, { onError });
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
  };

  return (
    <ScreenLayout>
      <BackHeader />
      <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View layout={LinearTransition} style={styles.intro}>
          <AppText variant="display">{signIn ? 'Welcome back.' : 'Start your shelf.'}</AppText>
          <AppText variant="body" tone="muted">
            {signIn ? 'Pick up where your reading left off.' : 'Takes a minute. Your first post takes two.'}
          </AppText>
        </Animated.View>

        <View style={[styles.segment, { backgroundColor: theme.surfaceAlt }]} accessibilityRole="tablist">
          {(['signin', 'signup'] as Mode[]).map(m => {
            const on = mode === m;
            return (
              <Tappable
                key={m}
                scaleTo={0.97}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => switchMode(m)}
                style={[styles.segBtn, on && { backgroundColor: theme.surface, boxShadow: '0px 1px 2px rgba(20,16,10,0.12)' }]}>
                <AppText variant="smallStrong" tone={on ? 'default' : 'muted'}>
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </AppText>
              </Tappable>
            );
          })}
        </View>

        <Animated.View layout={LinearTransition} style={styles.fields}>
          {!signIn ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <TextField
                label="Your name"
                placeholder="How other readers will see you"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.name}
              />
            </Animated.View>
          ) : null}
          <TextField
            ref={emailRef}
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
            error={errors.email}
          />
          <TextField
            ref={passRef}
            label="Password"
            placeholder={signIn ? 'Your password' : 'At least 8 characters'}
            value={password}
            onChangeText={setPassword}
            secureToggle
            autoComplete={signIn ? 'current-password' : 'new-password'}
            textContentType={signIn ? 'password' : 'newPassword'}
            returnKeyType="go"
            onSubmitEditing={submit}
            error={errors.password}
            labelRight={
              signIn ? (
                <Tappable onPress={() => navigation.navigate('ForgotPassword', { email })} accessibilityLabel="Forgot password">
                  <AppText variant="label" color={theme.accentText}>
                    Forgot password?
                  </AppText>
                </Tappable>
              ) : undefined
            }
          />
          <Button label={signIn ? 'Sign in' : 'Create account'} onPress={submit} loading={pending} style={styles.cta} />
        </Animated.View>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <AppText variant="caption" tone="subtle">
            or
          </AppText>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>
        <GoogleButton
          loading={auth.google.isPending}
          onPress={() => auth.google.mutate(undefined, { onError: e => toast.error((e as Error).message) })}
        />
        <AppText variant="caption" tone="subtle" center style={styles.legal}>
          By continuing you agree to Bookly’s Terms and Privacy Policy.
        </AppText>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  intro: { marginTop: 12, marginBottom: 26, gap: 8 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 999, gap: 4, marginBottom: 24 },
  segBtn: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  fields: { gap: 16 },
  cta: { marginTop: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  legal: { marginTop: 28 },
});
