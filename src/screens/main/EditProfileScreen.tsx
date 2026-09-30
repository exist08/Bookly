import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText } from '../../components/AppText';
import { AvatarPicker } from '../../components/AvatarPicker';
import { Button } from '../../components/Button';
import { ModalHeader } from '../../components/Header';
import { GoogleMark, Icon, type IconName } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { useThemeColors, type ThemeMode } from '../../theme/ThemeProvider';
import { useAuth, useMe, useUpdateProfile } from '../../hooks/queries';
import { usernameMessage, useUsernameCheck } from '../../hooks/useUsernameCheck';
import { ApiError, requestPasswordReset } from '../../data/api';
import type { RootScreenProps } from '../../navigation/types';

const MODES: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'System', icon: 'phone' },
  { mode: 'light', label: 'Light', icon: 'sun' },
  { mode: 'dark', label: 'Dark', icon: 'moon' },
];

export function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const { theme, mode, setMode } = useThemeColors();
  const { data: me } = useMe();
  const update = useUpdateProfile();
  const { signOut } = useAuth();
  const [name, setName] = useState(me?.displayName ?? '');
  const [username, setUsername] = useState(me?.username ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [avatar, setAvatar] = useState<string | null>(me?.avatarUri ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const status = useUsernameCheck(username, me?.username);

  if (!me) {
    return null;
  }

  const dirty = name !== me.displayName || username !== me.username || bio !== me.bio || avatar !== me.avatarUri;
  const blocked = status === 'taken' || status === 'invalid' || status === 'checking' || !name.trim();

  const save = () =>
    update.mutate(
      { displayName: name, username, bio, avatarUri: avatar },
      {
        onSuccess: () => {
          toast.success('Profile saved');
          navigation.goBack();
        },
        onError: e => (e instanceof ApiError && e.field ? setErrors({ [e.field]: e.message }) : toast.error((e as Error).message)),
      },
    );

  const changePassword = async () => {
    await requestPasswordReset(me.email);
    toast.success(`We sent a reset link to ${me.email}`);
  };

  return (
    <ScreenLayout>
      <ModalHeader
        title="Edit profile"
        onLeft={() => navigation.goBack()}
        rightLabel="Save"
        rightStyle="text"
        onRight={save}
        rightDisabled={!dirty || blocked}
        rightLoading={update.isPending}
      />
      <KeyboardAwareScrollView bottomOffset={30} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}>
          <AvatarPicker name={name} color={me.avatarColor} uri={avatar} onChange={setAvatar} size={108} />
        </View>

        <View style={styles.fields}>
          <TextField label="Name" value={name} onChangeText={setName} error={errors.displayName} />
          <TextField
            label="Username"
            prefix="@"
            value={username}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={t => {
              setUsername(t.replace(/\s/g, '').toLowerCase());
              setErrors({});
            }}
            error={errors.username ?? (status === 'taken' || status === 'invalid' ? usernameMessage[status] : null)}
            hint={status === 'available' ? `@${username} is available` : undefined}
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
            multiline
            value={bio}
            onChangeText={t => setBio(t.slice(0, 160))}
            placeholder="What do you like to read?"
            labelRight={
              <AppText variant="caption" tone="subtle">
                {bio.length} / 160
              </AppText>
            }
          />
        </View>

        <AppText variant="overline" tone="subtle" style={styles.section}>
          Appearance
        </AppText>
        <View style={[styles.segment, { backgroundColor: theme.surfaceAlt }]} accessibilityRole="radiogroup">
          {MODES.map(m => {
            const on = m.mode === mode;
            return (
              <Tappable
                key={m.mode}
                scaleTo={0.96}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${m.label} appearance`}
                onPress={() => setMode(m.mode)}
                style={[styles.segBtn, on && { backgroundColor: theme.surface, boxShadow: '0px 1px 2px rgba(20,16,10,0.12)' }]}>
                <Icon name={m.icon} size={18} color={on ? theme.text : theme.textMuted} />
                <AppText variant="smallStrong" tone={on ? 'default' : 'muted'}>
                  {m.label}
                </AppText>
              </Tappable>
            );
          })}
        </View>

        <AppText variant="overline" tone="subtle" style={styles.section}>
          Account
        </AppText>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Row label="Email" divider>
            <AppText variant="small" tone="subtle" numberOfLines={1}>
              {me.email}
            </AppText>
          </Row>
          <Row label="Signed in with" divider>
            <View style={styles.inline}>
              {me.provider === 'google' ? <GoogleMark size={16} /> : <Icon name="mail" size={16} color={theme.textSubtle} />}
              <AppText variant="small" tone="subtle">
                {me.provider === 'google' ? 'Google' : 'Email & password'}
              </AppText>
            </View>
          </Row>
          {me.provider === 'password' ? (
            <Row label="Change password" onPress={changePassword} divider chevron />
          ) : null}
          <Row label="Sign out" icon="signOut" onPress={() => signOut.mutate()} />
        </View>

        <View style={[styles.danger, { backgroundColor: theme.dangerSoft, borderColor: theme.dangerBorder }]}>
          <AppText variant="bodyStrong" tone="danger">
            Delete account
          </AppText>
          <AppText variant="small" tone="secondary">
            Removes your profile, all your posts and your votes. This can’t be undone.
          </AppText>
          <Button label="Delete my account" variant="dangerOutline" size="sm" onPress={() => navigation.navigate('DeleteAccount')} style={styles.dangerBtn} />
        </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

function Row({ label, children, onPress, divider, chevron, icon }: { label: string; children?: React.ReactNode; onPress?: () => void; divider?: boolean; chevron?: boolean; icon?: IconName }) {
  const { theme } = useThemeColors();
  const body = (
    <>
      <View style={styles.inline}>
        {icon ? <Icon name={icon} size={18} /> : null}
        <AppText variant="body">{label}</AppText>
      </View>
      <View style={styles.rowRight}>
        {children}
        {chevron ? <Icon name="chevronRight" size={18} color={theme.textSubtle} /> : null}
      </View>
    </>
  );
  const style = [styles.row, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }];
  return onPress ? (
    <Tappable scaleTo={0.99} onPress={onPress} style={style} accessibilityLabel={label}>
      {body}
    </Tappable>
  ) : (
    <View style={style}>{body}</View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 48 },
  avatar: { alignItems: 'center', marginBottom: 26 },
  fields: { gap: 16, paddingHorizontal: 8 },
  status: { width: 44, alignItems: 'center' },
  section: { marginTop: 30, marginBottom: 10, marginLeft: 8 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 999, gap: 4 },
  segBtn: { flex: 1, height: 44, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  group: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { minHeight: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  danger: { marginTop: 26, padding: 18, borderRadius: 18, borderWidth: 1, gap: 10 },
  dangerBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
