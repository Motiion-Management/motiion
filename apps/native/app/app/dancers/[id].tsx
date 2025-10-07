import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from 'convex/react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { api } from '@packages/backend/convex/_generated/api'
import { type Id } from '@packages/backend/convex/_generated/dataModel'
import { ProfileHeader } from '~/components/dancer-profile/ProfileHeader'
import { ProfileActionButtons } from '~/components/dancer-profile/ProfileActionButtons'
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel'
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet'
import { Icon } from '~/lib/icons/Icon'
import { Text } from '~/components/ui/text'

type ProfileState = 'default' | 'headshots' | 'details'

export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [profileState, setProfileState] = useState<ProfileState>('default')
  const [actionMenuExpanded, setActionMenuExpanded] = useState(false)

  // Fetch profile data
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  )

  // Animation values
  const defaultViewOpacity = useSharedValue(1)
  const defaultViewTranslateY = useSharedValue(0)

  const defaultViewStyle = useAnimatedStyle(() => ({
    opacity: defaultViewOpacity.value,
    transform: [{ translateY: defaultViewTranslateY.value }]
  }))

  const handleHeadshotPress = () => {
    setProfileState('headshots')
    defaultViewOpacity.value = withTiming(0, { duration: 300 })
    defaultViewTranslateY.value = withSpring(-50)
  }

  const handleHeadshotsClose = () => {
    setProfileState('default')
    defaultViewOpacity.value = withTiming(1, { duration: 300 })
    defaultViewTranslateY.value = withSpring(0)
  }

  const handleDetailsOpen = () => {
    setProfileState('details')
  }

  const handleDetailsClose = () => {
    setProfileState('default')
  }

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      // Navigate to home/default screen
      router.replace('/')
    }
  }

  if (!profileData) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-default">
        <Text>Loading...</Text>
      </View>
    )
  }

  const { dancer, headshotUrls, recentProjects, allProjects, training, isOwnProfile } =
    profileData

  const viewerType = isOwnProfile ? 'self' : 'dancer'
  const firstHeadshotUrl = headshotUrls[0] || null

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-surface-default">
        {/* Headshot Carousel (full screen, shown when state = 'headshots') */}
        {profileState === 'headshots' && (
          <HeadshotCarousel
            headshotUrls={headshotUrls}
            initialIndex={0}
            onClose={handleHeadshotsClose}
          />
        )}

        {/* Default View (animated) */}
        {profileState !== 'headshots' && (
          <Animated.View style={[{ flex: 1 }, defaultViewStyle]}>
            <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
              {/* Top Bar */}
              <View className="flex-row items-start justify-between px-4 pb-4">
                {/* Action buttons (left) */}
                <ProfileActionButtons
                  isExpanded={actionMenuExpanded}
                  onToggle={() => setActionMenuExpanded(!actionMenuExpanded)}
                  viewerType={viewerType}
                  className="flex-1"
                />

                <View className="flex-1" />

                {/* Profile Details button (center-right) */}
                <TouchableOpacity
                  onPress={handleDetailsOpen}
                  className="h-12 w-12 items-center justify-center rounded-full bg-surface-default">
                  <Icon name="info.circle" size={24} className="text-icon-default" />
                </TouchableOpacity>

                {/* Close button (right) */}
                <TouchableOpacity
                  onPress={handleClose}
                  className="ml-2 h-12 w-12 items-center justify-center rounded-full bg-surface-default">
                  <Icon name="xmark" size={24} className="text-icon-default" />
                </TouchableOpacity>
              </View>

              {/* Profile Header */}
              <View className="flex-1 px-4">
                <ProfileHeader
                  dancer={dancer}
                  headshotUrl={firstHeadshotUrl}
                  recentProjects={recentProjects}
                  onHeadshotPress={handleHeadshotPress}
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        )}

        {/* Profile Details Sheet */}
        <ProfileDetailsSheet
          isOpen={profileState === 'details'}
          onClose={handleDetailsClose}
          dancer={dancer}
          recentProjects={recentProjects}
          allProjects={allProjects}
          training={training}
        />
      </View>
    </BottomSheetModalProvider>
  )
}
