import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { GoogleMark, Icon, type IconName } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'soft';
type Size = 'lg' | 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const heights: Record<Size, number> = { lg: 56, md: 48, sm: 40 };

export function Button({ label, onPress, variant = 'primary', size = 'lg', icon, loading, disabled, style, accessibilityLabel }: Props) {
  const { theme } = useThemeColors();
  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.inverse, fg: theme.onInverse },
    secondary: { bg: theme.surface, fg: theme.text, border: theme.borderStrong },
    outline: { bg: 'transparent', fg: theme.text, border: theme.text },
    ghost: { bg: 'transparent', fg: theme.text },
    soft: { bg: theme.surfaceAlt, fg: theme.text },
    danger: { bg: theme.danger, fg: '#FFFFFF' },
    dangerOutline: { bg: 'transparent', fg: theme.danger, border: theme.danger },
  };
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Tappable
      onPress={onPress}
      disabled={inactive}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? 16 : 22,
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1 : 0,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 18 : 20} color={p.fg} strokeWidth={2} /> : null}
          <AppText variant={size === 'sm' ? 'smallStrong' : 'button'} color={p.fg}>
            {label}
          </AppText>
        </View>
      )}
    </Tappable>
  );
}

export function GoogleButton({ onPress, loading, label = 'Continue with Google' }: { onPress: () => void; loading?: boolean; label?: string }) {
  const { theme } = useThemeColors();
  return (
    <Tappable
      onPress={onPress}
      disabled={loading}
      accessibilityLabel={label}
      style={[styles.base, { height: 56, backgroundColor: theme.surface, borderColor: theme.borderStrong, borderWidth: 1 }]}>
      {loading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <View style={styles.row}>
          <GoogleMark />
          <AppText variant="button">{label}</AppText>
        </View>
      )}
    </Tappable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color,
  background,
  size = 44,
  iconSize = 22,
  filled,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  color?: string;
  background?: string;
  size?: number;
  iconSize?: number;
  filled?: boolean;
}) {
  return (
    <Tappable
      onPress={onPress}
      accessibilityLabel={label}
      scaleTo={0.9}
      style={[styles.icon, { width: size, height: size, borderRadius: size / 2, backgroundColor: background ?? 'transparent' }]}>
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </Tappable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { alignItems: 'center', justifyContent: 'center' },
});
