import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

export type TextInputRef = React.ComponentRef<typeof TextInput>;
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Fonts } from '../theme/fonts';
import { useThemeColors } from '../theme/ThemeProvider';

interface Props extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
  right?: React.ReactNode;
  labelRight?: React.ReactNode;
  secureToggle?: boolean;
}

/** Boxed input used in auth and settings forms. */
export const TextField = forwardRef<TextInputRef, Props>(function TextField(
  { label, hint, error, prefix, right, labelRight, secureToggle, secureTextEntry, style, multiline, onFocus, onBlur, ...rest },
  ref,
) {
  const { theme } = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? theme.danger : focused ? theme.text : theme.borderStrong;
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="label" tone="secondary" nativeID={`${label}-label`}>
          {label}
        </AppText>
        {labelRight}
      </View>
      <View
        style={[
          styles.box,
          { borderColor, backgroundColor: theme.surface },
          multiline && { height: undefined, minHeight: 96, alignItems: 'flex-start', paddingVertical: 12 },
        ]}>
        {prefix ? (
          <AppText variant="body" tone="subtle" style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.placeholder}
          selectionColor={theme.accent}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          multiline={multiline}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: theme.text }, multiline && styles.multiline, style]}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden(h => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            style={styles.accessory}>
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color={theme.textMuted} />
          </Pressable>
        ) : (
          right
        )}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="subtle">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

/** Borderless, underlined field used on the Share screen. */
export const UnderlineField = forwardRef<TextInputRef, TextInputProps & { label: string; optional?: boolean; large?: boolean; error?: string | null }>(
  function UnderlineField({ label, optional, large, error, style, ...rest }, ref) {
    const { theme } = useThemeColors();
    return (
      <View style={[styles.underline, { borderBottomColor: error ? theme.danger : theme.borderStrong }]}>
        <AppText variant="overline" tone="subtle">
          {label}
          {optional ? (
            <AppText variant="caption" tone="subtle">
              {'  (optional)'}
            </AppText>
          ) : null}
        </AppText>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.placeholder}
          selectionColor={theme.accent}
          style={[
            large ? styles.largeInput : styles.input,
            { color: theme.text, fontFamily: large ? Fonts.display : Fonts.regular },
            style,
          ]}
          {...rest}
        />
        {error ? (
          <AppText variant="caption" tone="danger">
            {error}
          </AppText>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  box: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: { marginRight: 2 },
  input: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 0, minHeight: 44 },
  multiline: { textAlignVertical: 'top', paddingTop: 0, minHeight: 72, paddingRight: 10 },
  accessory: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  underline: { borderBottomWidth: 1, paddingBottom: 6, gap: 2 },
  largeInput: { fontSize: 30, minHeight: 48, paddingVertical: 2 },
});
