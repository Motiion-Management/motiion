import React, { type ReactNode } from 'react';
import { useAnimatedScrollHeader } from './useAnimatedScrollHeader';
import type { AnimatedScrollHeaderConfig } from './types';
import { AnimatedScrollHeaderContext } from './context';
import { Header } from './Header';
import { ScrollView } from './ScrollView';

interface AnimatedScrollHeaderProps extends AnimatedScrollHeaderConfig {
  children: ReactNode;
}

export function AnimatedScrollHeader({ children, ...config }: AnimatedScrollHeaderProps) {
  const contextValue = useAnimatedScrollHeader(config);

  return (
    <AnimatedScrollHeaderContext.Provider value={contextValue}>
      {children}
    </AnimatedScrollHeaderContext.Provider>
  );
}

// Attach compound components
AnimatedScrollHeader.Header = Header;
AnimatedScrollHeader.ScrollView = ScrollView;
