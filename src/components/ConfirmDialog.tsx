import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { AppText } from './AppText';
import { Button } from './Button';
import { useThemeColors } from '../theme/ThemeProvider';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  art?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = 'Cancel', destructive, loading, art, onConfirm, onCancel }: Props) {
  const { theme } = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <Animated.View entering={FadeIn.duration(160)} style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          entering={ZoomIn.springify().damping(18)}
          accessibilityRole="alert"
          style={[styles.card, { backgroundColor: theme.background }]}>
          {art}
          <AppText variant="title" center>
            {title}
          </AppText>
          <AppText variant="small" tone="muted" center>
            {message}
          </AppText>
          <View style={styles.actions}>
            <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} size="md" loading={loading} onPress={onConfirm} />
            <Button label={cancelLabel} variant="soft" size="md" onPress={onCancel} disabled={loading} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  card: { borderRadius: 26, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 20, alignItems: 'center', gap: 12 },
  actions: { alignSelf: 'stretch', gap: 8, marginTop: 10 },
});
