import React, { useEffect, useState } from 'react'
import { View, Dimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSharedTransition } from '~/contexts/SharedTransitionContext'
import { type Id } from '@packages/backend/convex/_generated/dataModel'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface SharedHeadshotTransitionProps {
  dancerId: string
  headshotUrl: string
  children: React.ReactNode
  onExitTransitionComplete?: () => void
}

const SCREEN_HEIGHT_MODIFIER = 0.88
const IMAGE_HEIGHT = SCREEN_HEIGHT * SCREEN_HEIGHT_MODIFIER
const COLLAPSED_WIDTH = SCREEN_WIDTH - 12

export function SharedHeadshotTransition({
  dancerId,
  headshotUrl,
  children,
  onExitTransitionComplete,
}: SharedHeadshotTransitionProps) {
  const { transitionState, clearTransition } = useSharedTransition()
  const insets = useSafeAreaInsets()
  const [showTransition, setShowTransition] = useState(false)
  const [showChildren, setShowChildren] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Animation values
  const animatedX = useSharedValue(0)
  const animatedY = useSharedValue(0)
  const animatedWidth = useSharedValue(0)
  const animatedHeight = useSharedValue(0)
  const animatedBorderRadius = useSharedValue(0)
  const animatedOpacity = useSharedValue(0)

  // Calculate target position for collapsed headshot
  const targetX = (SCREEN_WIDTH - COLLAPSED_WIDTH) / 2
  const targetY = insets.top + 48
  const targetWidth = COLLAPSED_WIDTH
  const targetHeight = IMAGE_HEIGHT
  const targetBorderRadius = 25

  useEffect(() => {
    const isValidEnterTransition =
      transitionState.active &&
      transitionState.direction === 'enter' &&
      transitionState.targetDancerId === (dancerId as Id<'dancers'>) &&
      transitionState.measurements

    const isValidExitTransition =
      transitionState.active &&
      transitionState.direction === 'exit' &&
      transitionState.targetDancerId === (dancerId as Id<'dancers'>) &&
      transitionState.measurements

    if (isValidEnterTransition && transitionState.measurements) {
      const { pageX, pageY, width, height } = transitionState.measurements

      // Set initial values to avatar position
      animatedX.value = pageX
      animatedY.value = pageY
      animatedWidth.value = width
      animatedHeight.value = height
      animatedBorderRadius.value = width / 2 // Circle
      animatedOpacity.value = 1

      setShowTransition(true)

      // Animate to target position
      const springConfig = {
        damping: 20,
        stiffness: 90,
      }

      animatedX.value = withSpring(targetX, springConfig)
      animatedY.value = withSpring(targetY, springConfig)
      animatedWidth.value = withSpring(targetWidth, springConfig)
      animatedHeight.value = withSpring(targetHeight, springConfig)
      animatedBorderRadius.value = withSpring(targetBorderRadius, springConfig, (finished) => {
        if (finished) {
          // Animation complete - hide transition overlay and show actual component
          runOnJS(setShowTransition)(false)
          runOnJS(setShowChildren)(true)
          runOnJS(clearTransition)()
        }
      })
    } else if (isValidExitTransition && transitionState.measurements) {
      // Exit transition - animate from current position back to avatar
      const { pageX, pageY, width, height } = transitionState.measurements

      setIsExiting(true)
      setShowTransition(true)

      // Set initial values to current headshot position
      animatedX.value = targetX
      animatedY.value = targetY
      animatedWidth.value = targetWidth
      animatedHeight.value = targetHeight
      animatedBorderRadius.value = targetBorderRadius
      animatedOpacity.value = 1

      // Animate back to avatar position
      const springConfig = {
        damping: 22,
        stiffness: 100,
      }

      animatedX.value = withSpring(pageX, springConfig)
      animatedY.value = withSpring(pageY, springConfig)
      animatedWidth.value = withSpring(width, springConfig)
      animatedHeight.value = withSpring(height, springConfig)
      animatedBorderRadius.value = withSpring(width / 2, springConfig, (finished) => {
        if (finished) {
          // Animation complete - clear transition and notify parent
          runOnJS(setShowTransition)(false)
          runOnJS(clearTransition)()
          if (onExitTransitionComplete) {
            runOnJS(onExitTransitionComplete)()
          }
        }
      })
    } else {
      // No transition - show children immediately
      if (!isExiting) {
        setShowChildren(true)
      }
    }
  }, [
    transitionState,
    dancerId,
    clearTransition,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
    targetBorderRadius,
    insets.top,
    onExitTransitionComplete,
    isExiting,
  ])

  const transitionStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: animatedX.value,
    top: animatedY.value,
    width: animatedWidth.value,
    height: animatedHeight.value,
    borderRadius: animatedBorderRadius.value,
    overflow: 'hidden',
    opacity: animatedOpacity.value,
    zIndex: 9999,
  }))

  return (
    <>
      {/* Transition overlay */}
      {showTransition && (
        <Animated.View style={transitionStyle} pointerEvents="none">
          <Animated.Image
            source={{ uri: headshotUrl }}
            style={{
              width: animatedWidth.value,
              height: animatedHeight.value,
            }}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Actual children - hidden during transition */}
      {showChildren && <View style={{ flex: 1 }}>{children}</View>}
    </>
  )
}
