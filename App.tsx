import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Toaster } from 'sonner-native';
import AppNavigator from './src/AppNavigator';
import { queryClient } from './src/services/queryClient';
import { ThemeProvider, useThemeColors } from './src/theme/ThemeProvider';
import { Fonts } from './src/theme/fonts';

function ThemedToaster() {
  const { isDarkMode, theme } = useThemeColors();
  return (
    <Toaster
      position="top-center"
      theme={isDarkMode ? 'dark' : 'light'}
      toastOptions={{
        style: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth },
        titleStyle: { fontFamily: Fonts.semibold, color: theme.text },
        descriptionStyle: { fontFamily: Fonts.regular, color: theme.textMuted },
      }}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppNavigator />
              <ThemedToaster />
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
