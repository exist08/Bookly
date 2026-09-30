import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { useThemeColors } from '../theme/ThemeProvider';

export function EmptyShelf({ title, message, actionLabel, onAction }: { title: React.ReactNode; message: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useThemeColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.ghosts}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.ghost, { borderColor: theme.borderDashed, backgroundColor: i === 0 ? theme.surfaceSunken : 'transparent' }]}
          />
        ))}
      </View>
      <AppText variant="title" center>
        {title}
      </AppText>
      <AppText variant="small" tone="muted" center style={styles.msg}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} icon="plus" variant="outline" size="md" onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="heading" center>
        Something went sideways.
      </AppText>
      <AppText variant="small" tone="muted" center style={styles.msg}>
        {message}
      </AppText>
      <Button label="Try again" variant="secondary" size="md" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 28, gap: 14 },
  ghosts: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  ghost: { width: 96, height: 144, borderRadius: 3, borderWidth: 1.5, borderStyle: 'dashed' },
  msg: { maxWidth: 300 },
});
