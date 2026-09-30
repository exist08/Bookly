import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { AvatarPicker } from '../../components/AvatarPicker';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { useThemeColors } from '../../theme/ThemeProvider';
import { useAuth, useMe, useUpdateProfile } from '../../hooks/queries';
import { usernameMessage, useUsernameCheck } from '../../hooks/useUsernameCheck';
import { ApiError } from '../../data/api';

const suggest = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 18) || '';

/** Shown once after sign-up (email or Google) until the reader picks a username. */
export function ProfileSetupScreen() {
  const { theme } = useThemeColors();
  const { data: me } = useMe();
  const update = useUpdateProfile();
  const { signOut } = useAuth();
  const [name, setName] = useState(me?.displayName ?? '');
  const [username, setUsername] = useState(() => (me ? suggest(me.displayName) : ''));
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(me?.avatarUri ?? null);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(username);

  const ready = name.trim().length > 0 && (status === 'available' || status === 'idle') && username.length >= 3;

  const submit = () => {
    setError(null);
    update.mutate(
      { displayName: name, username, bio, avatarUri: avatar },
      {
        onSuccess: () => toast.success('Welcome to Bookly'),
        onError: e => (e instanceof ApiError && e.field === 'username' ? setError(e.message) : toast.error((e as Error).message)),
      },
    );
  };

  const msg = usernameMessage[status];
  const usernameHint = status === 'available' ? `@${username.toLowerCase()} ${msg}` : undefined;

  return (
    <ScreenLayout>
      <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.progress}>
          <View style={[styles.seg, { backgroundColor: theme.text }]} />
          <View style={[styles.seg, { backgroundColor: theme.text }]} />
        </View>
        <AppText variant="label" tone="subtle">
          Step 2 of 2 · Your profile
        </AppText>
        <View style={styles.intro}>
          <AppText variant="display">
            Make the shelf <Em>yours.</Em>
          </AppText>
          <AppText variant="body" tone="muted">
            This is how other readers will find you and your books.
          </AppText>
        </View>
        <View style={styles.avatarRow}>
          <AvatarPicker name={name} color={me?.avatarColor ?? theme.downvote} uri={avatar} onChange={setAvatar} size={96} />
          <View style={styles.avatarText}>
            <AppText variant="bodyStrong">{avatar ? 'Looking good' : 'Add a photo'}</AppText>
            <AppText variant="small" tone="muted">
              Optional. Your initials show until you add one.
            </AppText>
          </View>
        </View>
        <View style={styles.fields}>
          <TextField label="Name" value={name} onChangeText={setName} autoComplete="name" />
          <TextField
            label="Username"
            prefix="@"
            value={username}
            onChangeText={t => {
              setUsername(t.replace(/\s/g, '').toLowerCase());
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            error={error ?? (status === 'taken' || status === 'invalid' ? msg : null)}
            hint={usernameHint}
            right={
              status === 'checking' ? (
                <ActivityIndicator style={styles.status} color={theme.textMuted} />
              ) : status === 'available' ? (
                <View style={styles.status}>
                  <Icon name="check" size={20} color={theme.success} strokeWidth={2} />
                </View>
              ) : null
            }
          />
          <TextField
            label="Bio"
            labelRight={
              <AppText variant="caption" tone="subtle">
                {bio.length} / 160
              </AppText>
            }
            placeholder="What do you like to read?"
            value={bio}
            onChangeText={t => setBio(t.slice(0, 160))}
            multiline
          />
        </View>
        <Button label="Start reading" onPress={submit} disabled={!ready} loading={update.isPending} style={styles.cta} />
        <Button label="Use a different account" variant="ghost" size="sm" onPress={() => signOut.mutate()} />
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 10 },
  progress: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  intro: { gap: 10, marginTop: 18 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 20 },
  avatarText: { flex: 1, gap: 4 },
  fields: { gap: 16, marginTop: 24 },
  status: { width: 44, alignItems: 'center' },
  cta: { marginTop: 22 },
});
