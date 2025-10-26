import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader'
import { SectionCardPager } from '~/components/profile/SectionCardPager'
import { ProfessionalExperienceSection } from '~/components/profile/ProfessionalExperienceSection'

export default function ProfileScreen() {
  const [isCardsOpen, setIsCardsOpen] = useState(true)
  const [cardsHeight, setCardsHeight] = useState(0)

  const animatedHeight = useSharedValue(1)
  const animatedOpacity = useSharedValue(1)

  useEffect(() => {
    const config = { duration: 300 }
    animatedHeight.value = withTiming(isCardsOpen ? 1 : 0, config)
    animatedOpacity.value = withTiming(isCardsOpen ? 1 : 0, config)
  }, [isCardsOpen])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: cardsHeight > 0 ? cardsHeight * animatedHeight.value : undefined,
      opacity: animatedOpacity.value,
      overflow: 'hidden',
    }
  })

  function handleToggle() {
    setIsCardsOpen(!isCardsOpen)
  }

  return (
    <TabScreenLayout
      header={{
        middle: ProfileHeaderTitle,
        right: ProfileHeaderSettingsButton,
      }}
      headerCollapsed={!isCardsOpen}>
      <View className="flex-1 gap-8">
        <Animated.View
          className="gap-8"
          style={animatedStyle}
          onLayout={(event) => {
            if (cardsHeight === 0) {
              setCardsHeight(event.nativeEvent.layout.height)
            }
          }}>
          {/* Section Cards Pager */}
          <SectionCardPager />

          {/* Divider */}
          <View className="mx-4 h-px bg-border-tint" />
        </Animated.View>

        {/* Professional Experience Section */}
        <ProfessionalExperienceSection isCardsOpen={isCardsOpen} onToggle={handleToggle} />
      </View>
    </TabScreenLayout>
  )
}
