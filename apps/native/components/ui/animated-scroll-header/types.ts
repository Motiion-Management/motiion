import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { ScrollViewProps } from 'react-native';

export interface AnimatedScrollHeaderConfig {
  threshold?: number;
  headerHeight?: number;
  headerHeightCollapsed?: number;
}

export interface AnimatedScrollHeaderContextValue {
  scrollProgress: SharedValue<number>;
  scrollHandler: any;
  config: Required<AnimatedScrollHeaderConfig>;
}

export interface HeaderSlot {
  scrollProgress: SharedValue<number>;
}

export interface HeaderProps {
  left?: ReactNode | ((slot: HeaderSlot) => ReactNode);
  middle?: ReactNode | ((slot: HeaderSlot) => ReactNode);
  right?: ReactNode | ((slot: HeaderSlot) => ReactNode);
}

export interface AnimatedScrollViewProps extends Omit<ScrollViewProps, 'onScroll'> {
  children: ReactNode;
}
