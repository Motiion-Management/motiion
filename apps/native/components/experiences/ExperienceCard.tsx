import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { Text } from '~/components/ui/text'
import { cn } from '~/lib/cn'
import Check from '~/lib/icons/Check'
import { getExperienceDisplayTitle, getExperienceDisplaySubtitle } from '~/config/experienceTypes'

interface ExperienceCardProps {
  experience?: any
  placeholder: string
  onPress: () => void
  className?: string
}

export function ExperienceCard({ experience, placeholder, onPress, className }: ExperienceCardProps) {
  const hasExperience = !!experience
  const displayTitle = hasExperience ? getExperienceDisplayTitle(experience) : placeholder
  const displaySubtitle = hasExperience ? getExperienceDisplaySubtitle(experience) : null

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'w-full flex-row items-center justify-between rounded-full border px-5 py-4',
        hasExperience
          ? 'border-border-accent bg-surface-accent'
          : 'border-border-default bg-surface-high',
        className
      )}>
      <View className="flex-1">
        <Text variant="body" className="font-medium text-text-default">
          {displayTitle}
        </Text>
        {displaySubtitle && (
          <Text variant="footnote" className="text-text-low">
            {displaySubtitle}
          </Text>
        )}
      </View>
      {hasExperience && (
        <View className="ml-3">
          <Check className="h-5 w-5 color-icon-accent" />
        </View>
      )}
    </TouchableOpacity>
  )
}