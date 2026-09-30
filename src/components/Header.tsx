import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from './AppText';
import { IconButton } from './Button';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';

interface Props {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  bordered?: boolean;
}

export function BackHeader({ title, right, onBack, bordered }: Props) {
  const navigation = useNavigation();
  const { theme } = useThemeColors();
  return (
    <View style={[styles.bar, bordered && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <IconButton icon="back" label="Back" onPress={onBack ?? (() => navigation.goBack())} iconSize={24} />
      <AppText variant="smallStrong" numberOfLines={1} style={styles.title}>
        {title ?? ''}
      </AppText>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

/** Modal-style header: text action left, title, primary action right. */
export function ModalHeader({
  title,
  leftLabel = 'Cancel',
  onLeft,
  rightLabel,
  onRight,
  rightDisabled,
  rightLoading,
  rightStyle = 'pill',
}: {
  title: string;
  leftLabel?: string;
  onLeft: () => void;
  rightLabel: string;
  onRight: () => void;
  rightDisabled?: boolean;
  rightLoading?: boolean;
  rightStyle?: 'pill' | 'text';
}) {
  const { theme } = useThemeColors();
  const off = rightDisabled || rightLoading;
  return (
    <View style={[styles.bar, styles.modal, { borderBottomColor: theme.border }]}>
      <Tappable onPress={onLeft} style={styles.textBtn} accessibilityLabel={leftLabel}>
        <AppText variant="body" tone="secondary">
          {leftLabel}
        </AppText>
      </Tappable>
      <AppText variant="bodyStrong" style={styles.title}>
        {title}
      </AppText>
      {rightStyle === 'pill' ? (
        <Tappable
          onPress={onRight}
          disabled={off}
          accessibilityLabel={rightLabel}
          accessibilityState={{ disabled: !!off, busy: !!rightLoading }}
          style={[styles.pill, { backgroundColor: off ? theme.surfaceAlt : theme.inverse }]}>
          <AppText variant="smallStrong" color={off ? theme.textSubtle : theme.onInverse}>
            {rightLoading ? 'Saving…' : rightLabel}
          </AppText>
        </Tappable>
      ) : (
        <Tappable onPress={onRight} disabled={off} style={[styles.textBtn, styles.textRight]} accessibilityLabel={rightLabel}>
          <AppText variant="bodyStrong" color={off ? theme.textSubtle : theme.accentText}>
            {rightLoading ? 'Saving…' : rightLabel}
          </AppText>
        </Tappable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 56, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modal: { paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { flex: 1, textAlign: 'center' },
  side: { minWidth: 44, alignItems: 'flex-end' },
  textBtn: { minWidth: 72, height: 44, justifyContent: 'center', paddingHorizontal: 6 },
  textRight: { alignItems: 'flex-end' },
  pill: { height: 38, paddingHorizontal: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center', minWidth: 72 },
});
