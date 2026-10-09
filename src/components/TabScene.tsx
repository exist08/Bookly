import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { SharedTransitionBoundary } from 'react-native-reanimated';

/**
 * Required for shared-element transitions in Reanimated 4.7+.
 *
 * Reanimated no longer finds screens by itself: on every commit it looks for
 * the top-most *active* `SharedTransitionBoundary` and only searches inside it
 * for `sharedTransitionTag`s. A transition runs when that top-most boundary
 * changes between two commits (e.g. Feed → PostDetail on push, back on pop).
 *
 * So every screen that is a source OR a destination of a cover transition must
 * render inside one of these, active only while the screen is focused. Without
 * a boundary on the destination, the "top screen" never changes and nothing
 * animates.
 */
export function TransitionScope({ children }: { children: React.ReactNode }) {
  const focused = useIsFocused();
  return <SharedTransitionBoundary isActive={focused}>{children}</SharedTransitionBoundary>;
}

/** Tab screens use the same scope; kept as an alias for readability at call sites. */
export const TabScene = TransitionScope;
