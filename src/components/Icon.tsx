import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useThemeColors } from '../theme/ThemeProvider';

export type IconName =
  | 'back' | 'chevronRight' | 'close' | 'plus' | 'home' | 'user' | 'upvote' | 'downvote'
  | 'share' | 'more' | 'camera' | 'image' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'check'
  | 'edit' | 'trash' | 'sliders' | 'signOut' | 'info' | 'arrowRight' | 'sun' | 'moon' | 'phone';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color, filled = false, strokeWidth = 1.75 }: Props) {
  const { theme } = useThemeColors();
  const c = color ?? theme.text;
  const common = {
    stroke: c,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const fill = filled ? c : 'none';
  const body = (() => {
    switch (name) {
      case 'back':
        return <Path {...common} d="m15 18-6-6 6-6" />;
      case 'chevronRight':
        return <Path {...common} d="m9 18 6-6-6-6" />;
      case 'close':
        return <Path {...common} d="M6 6l12 12M18 6 6 18" />;
      case 'plus':
        return <Path {...common} d="M12 5v14M5 12h14" />;
      case 'arrowRight':
        return <Path {...common} d="M5 12h14M13 6l6 6-6 6" />;
      case 'home':
        return <Path {...common} fill={fill} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />;
      case 'user':
        return (
          <>
            <Circle {...common} fill={fill} cx="12" cy="8" r="4" />
            <Path {...common} fill={fill} d={filled ? 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6z' : 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6'} />
          </>
        );
      case 'upvote':
        return <Path {...common} fill={fill} d="M12 4 4 13h5v7h6v-7h5z" />;
      case 'downvote':
        return <Path {...common} fill={fill} d="M12 20 20 11h-5V4H9v7H4z" />;
      case 'share':
        return (
          <>
            <Path {...common} d="M12 3v12M7 8l5-5 5 5" />
            <Path {...common} d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </>
        );
      case 'more':
        return (
          <>
            <Circle cx="5" cy="12" r="1.7" fill={c} />
            <Circle cx="12" cy="12" r="1.7" fill={c} />
            <Circle cx="19" cy="12" r="1.7" fill={c} />
          </>
        );
      case 'camera':
        return (
          <>
            <Path {...common} d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
            <Circle {...common} cx="12" cy="13" r="3.5" />
          </>
        );
      case 'image':
        return (
          <>
            <Rect {...common} x="3" y="3" width="18" height="18" rx="2" />
            <Circle {...common} cx="9" cy="9" r="2" />
            <Path {...common} d="m21 15-5-5L5 21" />
          </>
        );
      case 'mail':
        return (
          <>
            <Rect {...common} x="3" y="5" width="18" height="14" rx="2" />
            <Path {...common} d="m3 7 9 6 9-6" />
          </>
        );
      case 'lock':
        return (
          <>
            <Rect {...common} x="4" y="11" width="16" height="10" rx="2" />
            <Path {...common} d="M8 11V7a4 4 0 0 1 8 0v4" />
          </>
        );
      case 'eye':
        return (
          <>
            <Path {...common} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <Circle {...common} cx="12" cy="12" r="3" />
          </>
        );
      case 'eyeOff':
        return (
          <>
            <Path {...common} d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.1 6.1C3.4 7.9 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.9-2.1" />
            <Path {...common} d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
          </>
        );
      case 'check':
        return <Path {...common} d="m5 12 5 5 9-10" />;
      case 'edit':
        return (
          <>
            <Path {...common} d="M4 20h4L19 9l-4-4L4 16z" />
            <Path {...common} d="m13.5 6.5 4 4" />
          </>
        );
      case 'trash':
        return <Path {...common} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />;
      case 'sliders':
        return (
          <>
            <Path {...common} d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
            <Circle {...common} cx="15" cy="6" r="2" />
            <Circle {...common} cx="9" cy="12" r="2" />
            <Circle {...common} cx="17" cy="18" r="2" />
          </>
        );
      case 'signOut':
        return <Path {...common} d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" />;
      case 'info':
        return (
          <>
            <Circle {...common} cx="12" cy="12" r="9" />
            <Path {...common} d="M12 8v5M12 16.5v.01" />
          </>
        );
      case 'sun':
        return (
          <>
            <Circle {...common} cx="12" cy="12" r="4" />
            <Path {...common} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        );
      case 'moon':
        return <Path {...common} d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />;
      case 'phone':
        return (
          <>
            <Rect {...common} x="6" y="2" width="12" height="20" rx="2.5" />
            <Path {...common} d="M11 18h2" />
          </>
        );
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}

export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}
