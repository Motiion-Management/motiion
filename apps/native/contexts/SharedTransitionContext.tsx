import React, { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react'
import { type Id } from '@packages/backend/convex/_generated/dataModel'

interface AvatarMeasurements {
  x: number
  y: number
  width: number
  height: number
  pageX: number
  pageY: number
}

interface TransitionState {
  active: boolean
  direction: 'enter' | 'exit' | null
  measurements: AvatarMeasurements | null
  targetDancerId: Id<'dancers'> | null
}

interface SharedTransitionContextValue {
  transitionState: TransitionState
  startTransition: (measurements: AvatarMeasurements, dancerId: Id<'dancers'>) => void
  startExitTransition: (measurements: AvatarMeasurements, dancerId: Id<'dancers'>) => void
  clearTransition: () => void
}

const SharedTransitionContext = createContext<SharedTransitionContextValue | undefined>(undefined)

export function SharedTransitionProvider({ children }: PropsWithChildren) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    active: false,
    direction: null,
    measurements: null,
    targetDancerId: null,
  })

  const startTransition = useCallback((measurements: AvatarMeasurements, dancerId: Id<'dancers'>) => {
    setTransitionState({
      active: true,
      direction: 'enter',
      measurements,
      targetDancerId: dancerId,
    })
  }, [])

  const startExitTransition = useCallback((measurements: AvatarMeasurements, dancerId: Id<'dancers'>) => {
    setTransitionState({
      active: true,
      direction: 'exit',
      measurements,
      targetDancerId: dancerId,
    })
  }, [])

  const clearTransition = useCallback(() => {
    setTransitionState({
      active: false,
      direction: null,
      measurements: null,
      targetDancerId: null,
    })
  }, [])

  return (
    <SharedTransitionContext.Provider
      value={{
        transitionState,
        startTransition,
        startExitTransition,
        clearTransition,
      }}>
      {children}
    </SharedTransitionContext.Provider>
  )
}

export function useSharedTransition() {
  const context = useContext(SharedTransitionContext)
  if (context === undefined) {
    throw new Error('useSharedTransition must be used within a SharedTransitionProvider')
  }
  return context
}
