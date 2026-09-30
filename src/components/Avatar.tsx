import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { initials } from '../utils/format';
import type { User } from '../types/models';

interface Props {
  user: Pick<User, 'displayName' | 'avatarUri' | 'avatarColor'>;
  size?: number;
  ring?: string;
}

export function Avatar({ user, size = 38, ring }: Props) {
  const inner = (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: user.avatarColor }]}>
      {user.avatarUri ? (
        <Image source={{ uri: user.avatarUri }} style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.42 }]}>{initials(user.displayName)}</Text>
      )}
    </View>
  );
  if (!ring) {
    return inner;
  }
  return (
    <View style={[styles.ring, { borderColor: ring, width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { fontFamily: Fonts.display, color: '#FAF7F0' },
  ring: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
