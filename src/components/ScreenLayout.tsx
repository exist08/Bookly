import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { useThemeColors } from '../theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  /** Tab screens draw under the floating tab bar, so they skip the bottom inset. */
  hideBottomPadding?: boolean;
  hideTopPadding?: boolean;
  backgroundColor?: string;
  /** Force light status-bar content (e.g. on the dark splash). */
  barStyle?: 'light' | 'dark';
  style?: ViewStyle;
}

export function ScreenLayout({
  children,
  hideBottomPadding,
  hideTopPadding,
  backgroundColor,
  barStyle,
  style,
}: Props) {
  const { theme, isDarkMode } = useThemeColors();
  const edges: Edge[] = [];
  if (!hideTopPadding) {
    edges.push('top');
  }
  if (!hideBottomPadding) {
    edges.push('bottom');
  }
  return (
    <View style={[styles.root, { backgroundColor: backgroundColor ?? theme.background }]}>
      <SystemBars style={barStyle ?? (isDarkMode ? 'light' : 'dark')} />
      <SafeAreaView edges={edges} style={[styles.root, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
