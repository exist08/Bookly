import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';
import { pickImage } from '../utils/imagePicker';

interface Props {
  name: string;
  color: string;
  uri: string | null;
  onChange: (uri: string | null) => void;
  size?: number;
}

export function chooseImage(kind: 'cover' | 'avatar', onPicked: (uri: string) => void, onRemove?: () => void) {
  const buttons: Parameters<typeof Alert.alert>[2] = [
    { text: 'Take photo', onPress: async () => { const u = await pickImage('camera', kind); if (u) { onPicked(u); } } },
    { text: 'Choose from library', onPress: async () => { const u = await pickImage('library', kind); if (u) { onPicked(u); } } },
  ];
  if (onRemove) {
    buttons.push({ text: 'Remove photo', style: 'destructive', onPress: onRemove });
  }
  buttons.push({ text: 'Cancel', style: 'cancel' });
  Alert.alert(kind === 'cover' ? 'Book cover' : 'Profile photo', undefined, buttons);
}

/** Avatar with a camera badge; shows a dashed placeholder until a photo or name exists. */
export function AvatarPicker({ name, color, uri, onChange, size = 104 }: Props) {
  const { theme } = useThemeColors();
  const empty = !uri && !name.trim();
  const open = () => chooseImage('avatar', onChange, uri ? () => onChange(null) : undefined);
  return (
    <Tappable onPress={open} accessibilityLabel={uri ? 'Change profile photo' : 'Add profile photo'} scaleTo={0.95}>
      {empty ? (
        <View style={[styles.empty, { width: size, height: size, borderRadius: size / 2, borderColor: theme.borderDashed, backgroundColor: theme.surfaceSunken }]}>
          <Icon name="user" size={size * 0.36} color={theme.textMuted} strokeWidth={1.5} />
        </View>
      ) : (
        <Avatar user={{ displayName: name || '?', avatarUri: uri, avatarColor: color }} size={size} />
      )}
      <View style={[styles.badge, { backgroundColor: theme.inverse, borderColor: theme.background }]}>
        <Icon name="camera" size={18} color={theme.onInverse} />
      </View>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  empty: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -4, bottom: -4, width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
