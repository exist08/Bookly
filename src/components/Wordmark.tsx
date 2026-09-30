import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useThemeColors } from '../theme/ThemeProvider';

export function Wordmark({ size = 30, color, dot }: { size?: number; color?: string; dot?: string }) {
  const { theme } = useThemeColors();
  const d = Math.max(6, Math.round(size / 5));
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Bookly">
      <Text style={{ fontFamily: Fonts.displayItalic, fontSize: size, lineHeight: size * 1.1, color: color ?? theme.text }}>Bookly</Text>
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: dot ?? theme.accent, marginBottom: size * 0.2 }} />
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 } });
