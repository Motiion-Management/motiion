import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'

import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import ChevronRight from '~/lib/icons/ChevronRight'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'

interface ExperienceItemProps {
  title: string
  type: string
  onEdit?: () => void
}

function ExperienceItem({ title, type, onEdit }: ExperienceItemProps) {
  return (
    <Pressable
      onPress={onEdit}
      className="flex-row items-center justify-between border-b border-border-tint py-4">
      <View className="flex-1 gap-1">
        <Text variant="body" className="text-text-default">
          {title || 'Untitled Project'}
        </Text>
        <Text variant="labelXs" className="text-text-low">
          {type}
        </Text>
      </View>
      {onEdit && <ChevronRight className="color-icon-default" />}
    </Pressable>
  )
}

export default function ExperiencesReviewScreen() {
  const experiences = useQuery(api.users.experiences.getMyExperiences) || []
  const training = useQuery(api.training.getMyTraining) || []

  const handleEditExperiences = useCallback(() => {
    router.push('/app/onboarding/review/training') // Placeholder: route to training editor or experiences editor if/when added
  }, [])

  const handleEditTraining = useCallback(() => {
    router.push('/app/onboarding/review/training')
  }, [])

  const handleComplete = useCallback(() => {
    router.push('/app/onboarding/complete')
  }, [])

  return (
    <BaseOnboardingScreen
      title="Review your experience"
      description="Your performance history and training"
      canProgress={true}
      bottomActionSlot={
        <Button size="lg" className="w-full" onPress={handleComplete}>
          <Text>Complete Profile</Text>
        </Button>
      }>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Experiences Section */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="title3">Experience</Text>
              <Button variant="plain" onPress={handleEditExperiences}>
                <Text className="text-accent-primary">Edit</Text>
              </Button>
            </View>
            
            {experiences.length === 0 ? (
              <View className="p-4 bg-surface-secondary rounded-lg">
                <Text variant="footnote" className="text-text-secondary text-center">
                  No experiences added yet.
                </Text>
              </View>
            ) : (
              <View>
                {experiences.slice(0, 5).map((exp: any) => (
                  <ExperienceItem
                    key={exp._id}
                    title={exp.title}
                    type={exp.type}
                    onEdit={handleEditExperiences}
                  />
                ))}
                {experiences.length > 5 && (
                  <Pressable onPress={handleEditExperiences} className="py-4">
                    <Text className="text-accent-primary text-center">
                      +{experiences.length - 5} more experiences
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Training Section */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="title3">Training</Text>
              <Button variant="plain" onPress={handleEditTraining}>
                <Text className="text-accent-primary">Edit</Text>
              </Button>
            </View>
            
            {training.length === 0 ? (
              <View className="p-4 bg-surface-secondary rounded-lg">
                <Text variant="footnote" className="text-text-secondary text-center">
                  No training added yet.
                </Text>
              </View>
            ) : (
              <View>
                {training.slice(0, 5).map((train: any) => (
                  <ExperienceItem
                    key={train._id}
                    title={train.institution}
                    type={train.type}
                    onEdit={handleEditTraining}
                  />
                ))}
                {training.length > 5 && (
                  <Pressable onPress={handleEditTraining} className="py-4">
                    <Text className="text-accent-primary text-center">
                      +{training.length - 5} more training
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Edits navigate to /app/onboarding/review/[step] */}
    </BaseOnboardingScreen>
  )
}
