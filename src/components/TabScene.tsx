import React from 'react';
import { useNavigationState, useRoute } from '@react-navigation/native';
import { SharedTransitionBoundary } from 'react-native-reanimated';

/**
 * Reanimated only runs shared-element transitions inside the native stack.
 * Tab screens stay mounted side by side, so each one is wrapped in a boundary
 * that is active only while its tab is the selected one — covers on the
 * hidden tab can then never be picked as the transition source.
 */
export function TabScene({ children }: { children: React.ReactNode }) {
  const route = useRoute();
  const active = useNavigationState(s => s.routes[s.index]?.key === route.key);
  return <SharedTransitionBoundary isActive={active}>{children}</SharedTransitionBoundary>;
}
