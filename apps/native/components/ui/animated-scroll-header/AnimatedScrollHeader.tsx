import React, { createContext, useContext, type ReactNode } from 'react';
import { useAnimatedScrollHeader } from './useAnimatedScrollHeader';
import type { AnimatedScrollHeaderConfig, AnimatedScrollHeaderContextValue } from './types';
import { Header } from './Header';
import { ScrollView } from './ScrollView';

const AnimatedScrollHeaderContext = createContext<AnimatedScrollHeaderContextValue | null>(null);

export function useAnimatedScrollHeaderContext() {
  const context = useContext(AnimatedScrollHeaderContext);
  if (!context) {
    throw new Error('useAnimatedScrollHeaderContext must be used within AnimatedScrollHeader');
  }
  return context;
}

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
