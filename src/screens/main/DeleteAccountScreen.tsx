import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText, Em } from '../../components/AppText';
import { BackHeader } from '../../components/Header';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { useThemeColors } from '../../theme/ThemeProvider';
import { useDeleteAccount, useMe, useProfile } from '../../hooks/queries';
import { compactNumber } from '../../utils/format';
import type { RootScreenProps } from '../../navigation/types';

export function DeleteAccountScreen({ navigation }: RootScreenProps<'DeleteAccount'>) {
  const { theme } = useThemeColors();
  const { data: me } = useMe();
  const { data: profile } = useProfile(me?.id ?? '');
  const del = useDeleteAccount();
  const [typed, setTyped] = useState('');
  const ok = typed.trim().toUpperCase() === 'DELETE';

  if (!me) {
    return null;
  }
  const books = profile?.stats.books ?? 0;
  const upvotes = profile?.stats.upvotes ?? 0;
  const items = [
    { t: 'Your profile, photo and username', d: `@${me.username} becomes available to others.` },
    { t: `All ${books} of your book posts`, d: `Including their covers and the ${compactNumber(upvotes)} upvotes they earned.` },
    { t: 'Every vote you have cast', d: 'Scores on other readers’ posts update.' },
  ];

  return (
    <ScreenLayout>
      <BackHeader title="Delete account" />
      <KeyboardAwareScrollView bottomOffset={30} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="display">
          Before you <Em>go.</Em>
        </AppText>
        <AppText variant="body" tone="muted">
          Deleting your account permanently removes:
        </AppText>
        <View style={[styles.list, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {items.map(i => (
            <View key={i.t} style={styles.item}>
              <View style={[styles.x, { backgroundColor: theme.dangerSoft }]}>
                <Icon name="close" size={12} color={theme.danger} strokeWidth={2.5} />
              </View>
              <View style={styles.itemText}>
                <AppText variant="bodyStrong">{i.t}</AppText>
                <AppText variant="caption" tone="muted">
                  {i.d}
                </AppText>
              </View>
            </View>
          ))}
        </View>
        <TextField
          label="Type DELETE to confirm"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="DELETE"
        />
        <View style={styles.actions}>
          <Button
            label="Delete my account"
            icon="trash"
            variant="danger"
            disabled={!ok}
            loading={del.isPending}
            onPress={() =>
              del.mutate(undefined, {
                onSuccess: () => toast('Your account was deleted. Thanks for reading with us.'),
                onError: e => toast.error((e as Error).message),
              })
            }
          />
          <Button label="Keep my account" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 12 },
  list: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 16, marginTop: 8, marginBottom: 12 },
  item: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  x: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemText: { flex: 1, gap: 2 },
  actions: { marginTop: 24, gap: 6 },
});
