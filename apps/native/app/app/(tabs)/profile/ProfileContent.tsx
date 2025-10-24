import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

import { SectionCardPager } from '~/components/profile/SectionCardPager'
import { ProfessionalExperienceSection } from '~/components/profile/ProfessionalExperienceSection'
import { useTabScroll } from '~/components/layouts/TabScrollContext'

// Constants for scroll positions
const SCROLL_TO_STICKY_OFFSET = 200 // Target scroll position for sticky header
const SCROLL_THRESHOLD_AT_TOP = 50 // Consider "at top" if scrollY < this

export function ProfileContent() {
  const [isHeaderOpen, setIsHeaderOpen] = useState(true)
  const [headerHeight, setHeaderHeight] = useState(0)

  const { scrollY, scrollToOffset } = useTabScroll()

  const animatedHeight = useSharedValue(1)
  const animatedOpacity = useSharedValue(1)

  useEffect(() => {
    animatedHeight.value = withTiming(isHeaderOpen ? 1 : 0, { duration: 300 })
    animatedOpacity.value = withTiming(isHeaderOpen ? 1 : 0, { duration: 300 })
  }, [isHeaderOpen])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight > 0 ? headerHeight * animatedHeight.value : undefined,
      opacity: animatedOpacity.value,
      overflow: 'hidden',
    }
  })

  function handleHeaderToggle() {
    'worklet'
    const currentScrollY = scrollY.value
    const isAtTop = currentScrollY < SCROLL_THRESHOLD_AT_TOP
    const isScrolled = currentScrollY >= SCROLL_TO_STICKY_OFFSET

    if (isAtTop && isHeaderOpen) {
      // State 1: At top, cards visible → Collapse + scroll to sticky
      runOnJS(setIsHeaderOpen)(false)
      runOnJS(scrollToOffset)(SCROLL_TO_STICKY_OFFSET, true)
    } else if (isScrolled && !isHeaderOpen) {
      // State 2: Scrolled, header sticky, collapsed → Toggle to expanded (prep)
      runOnJS(setIsHeaderOpen)(true)
    } else if (isScrolled && isHeaderOpen) {
      // State 3: Scrolled, expanded state → Scroll to top + reveal cards
      runOnJS(scrollToOffset)(0, true)
    } else {
      // Fallback: just toggle
      runOnJS(setIsHeaderOpen)(!isHeaderOpen)
    }
  }

  return (
    <View className="gap-8">
      <Animated.View
        className="gap-8"
        style={animatedStyle}
        onLayout={(event) => {
          if (headerHeight === 0) {
            setHeaderHeight(event.nativeEvent.layout.height)
          }
        }}>
        {/* Section Cards Pager */}
        <SectionCardPager />

        {/* Divider */}
        <View className="mx-4 h-px bg-border-tint" />
      </Animated.View>

      {/* Professional Experience Section */}
      <ProfessionalExperienceSection
        isHeaderOpen={isHeaderOpen}
        onHeaderChangeIntent={handleHeaderToggle}
      />
    </View>
  )
}
