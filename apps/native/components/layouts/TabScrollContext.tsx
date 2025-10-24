import { createContext, useContext } from 'react'
import { type SharedValue } from 'react-native-reanimated'

interface TabScrollContextValue {
  scrollY: SharedValue<number>
  scrollToOffset: (offset: number, animated?: boolean) => void
}

export const TabScrollContext = createContext<TabScrollContextValue | null>(null)

export function useTabScroll() {
  const context = useContext(TabScrollContext)
  if (!context) {
    throw new Error('useTabScroll must be used within TabScreenLayout')
  }
  return context
}
