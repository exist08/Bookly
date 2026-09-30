import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Tappable } from './Tappable';
import { useThemeColors } from '../theme/ThemeProvider';

const ICONS: Record<string, { icon: IconName; label: string }> = {
  Feed: { icon: 'home', label: 'Feed' },
  Shelf: { icon: 'user', label: 'Shelf' },
};

export const TAB_BAR_HEIGHT = 66;

/** Feed · [Share a book] · Shelf — the centre action opens the composer modal. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();

  const tab = (index: number) => {
    const route = state.routes[index];
    const focused = state.index === index;
    const meta = ICONS[route.name];
    const color = focused ? theme.text : theme.textSubtle;
    return (
      <Tappable
        key={route.key}
        scaleTo={0.9}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={meta.label}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
        style={styles.tab}>
        <Icon name={meta.icon} size={24} color={color} filled={focused} strokeWidth={focused ? 1.5 : 1.75} />
        <AppText variant="caption" color={color} style={{ fontSize: 11 }}>
          {meta.label}
        </AppText>
      </Tappable>
    );
  };

  return (
    <View
      accessibilityRole="tabbar"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.tabBar, borderTopColor: theme.border }]}>
      {tab(0)}
      <Tappable
        onPress={() => navigation.getParent()?.navigate('Compose')}
        accessibilityLabel="Share a book"
        style={[styles.cta, { backgroundColor: theme.inverse }]}>
        <Icon name="plus" size={20} color={theme.onInverse} strokeWidth={2} />
        <AppText variant="smallStrong" color={theme.onInverse} style={{ fontSize: 15 }}>
          Share a book
        </AppText>
      </Tappable>
      {tab(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: { width: 64, height: 48, alignItems: 'center', justifyContent: 'center', gap: 2 },
  cta: { height: 50, paddingHorizontal: 22, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8 },
});
