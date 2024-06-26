'use client'
import { RefObject, createContext, useContext, useRef } from 'react'

export const MainRefContext = createContext<RefObject<HTMLElement> | undefined>(
  undefined
)

export function useMainRef() {
  return useContext(MainRefContext)
}

export function MainWithRefContext({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  const mainRef = useRef<HTMLDivElement>(null)

  return (
    <MainRefContext.Provider value={mainRef}>
      <main ref={mainRef} className={className}>
        {children}
      </main>
    </MainRefContext.Provider>
  )
}
