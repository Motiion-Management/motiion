import { createContext, useContext } from 'react';
import type { AnimatedScrollHeaderContextValue } from './types';

export const AnimatedScrollHeaderContext = createContext<AnimatedScrollHeaderContextValue | null>(
  null
);

export function useAnimatedScrollHeaderContext() {
  const context = useContext(AnimatedScrollHeaderContext);
  if (!context) {
    throw new Error('useAnimatedScrollHeaderContext must be used within AnimatedScrollHeader');
  }
  return context;
}
