import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { View, ScrollView, Pressable } from 'react-native'

import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { useUser } from '~/hooks/useUser'
import ChevronRight from '~/lib/icons/ChevronRight'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'

interface ProfileFieldProps {
  label: string
  value?: string | string[] | null
  onEdit?: () => void
  isArray?: boolean
}

function ProfileField({ label, value, onEdit, isArray = false }: ProfileFieldProps) {
  const displayValue = (() => {
    if (!value) return 'Not provided'
    if (isArray && Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not provided'
    }
    return String(value)
  })()

  return (
    <Pressable
      onPress={onEdit}
      className="flex-row items-center justify-between border-b border-border-tint py-4">
      <View className="flex-1 gap-1">
        <Text variant="labelXs" className="text-text-low">
          {label}
        </Text>
        <Text variant="body" className="text-text-default">
          {displayValue}
        </Text>
      </View>
      {onEdit && <ChevronRight className="color-icon-default" />}
    </Pressable>
  )
}

export default function GeneralReviewScreen() {
  const { user } = useUser()

  const handleEditField = useCallback((fieldName: string) => {
    // TODO: Open form in sheet modal
    console.log('Edit field:', fieldName)
  }, [])

  const handleContinue = useCallback(() => {
    router.push('/app/onboarding-v2/review/experiences')
  }, [])

  return (
    <BaseOnboardingScreen
      title="Review your profile"
      description="Check your information and make edits if needed"
      canProgress={true}
      primaryAction={{
        onPress: handleContinue,
      }}
      scrollEnabled={false}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Attributes Section */}
          <View>
            <Text variant="title3" className="mb-4">Personal Information</Text>
            <ProfileField
              label="Display Name"
              value={user?.displayName}
              onEdit={() => handleEditField('display-name')}
            />
            <ProfileField
              label="Height"
              value={
                user?.attributes?.height
                  ? `${user.attributes.height.feet}'${user.attributes.height.inches}"`
                  : undefined
              }
              onEdit={() => handleEditField('height')}
            />
            <ProfileField
              label="Ethnicity"
              value={user?.attributes?.ethnicity}
              isArray={true}
              onEdit={() => handleEditField('ethnicity')}
            />
            <ProfileField
              label="Hair Color"
              value={user?.attributes?.hairColor}
              onEdit={() => handleEditField('hair-color')}
            />
            <ProfileField
              label="Eye Color"
              value={user?.attributes?.eyeColor}
              onEdit={() => handleEditField('eye-color')}
            />
            <ProfileField
              label="Gender"
              value={user?.attributes?.gender}
              onEdit={() => handleEditField('gender')}
            />
          </View>

          {/* Work Details Section */}
          <View>
            <Text variant="title3" className="mb-4">Work Information</Text>
            <ProfileField
              label="Headshots"
              value={user?.headshots?.length ? `${user.headshots.length} photos` : undefined}
              onEdit={() => handleEditField('headshots')}
            />
            <ProfileField
              label="Sizing"
              value={user?.sizing ? `General sizing information provided` : undefined}
              onEdit={() => handleEditField('sizing')}
            />
            <ProfileField
              label="Primary Location"
              value={user?.location ? `${user.location.city}, ${user.location.state}` : undefined}
              onEdit={() => handleEditField('location')}
            />
            <ProfileField
              label="Work Locations"
              value={user?.workLocation}
              isArray={true}
              onEdit={() => handleEditField('work-location')}
            />
            <ProfileField
              label="Agency"
              value={user?.representation?.agencyId ? 'Set' : 'Independent'}
              onEdit={() => handleEditField('representation')}
            />
          </View>
        </View>
      </ScrollView>
    </BaseOnboardingScreen>
  )
}