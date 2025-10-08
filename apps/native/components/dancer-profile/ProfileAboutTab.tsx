import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from '~/components/ui/text'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'

interface ProfileAboutTabProps {
  dancer: Doc<'dancers'>
  recentProjects: Array<any>
}

export function ProfileAboutTab({ dancer, recentProjects }: ProfileAboutTabProps) {
  const workLocations = dancer.workLocation || []
  const genres = dancer.genres || []
  const representation = dancer.representation
  const sagAftraId = dancer.sagAftraId

  const affiliations = []
  if (representation?.agencyId) {
    affiliations.push('Bloc Talent Agency') // TODO: Get actual agency name
  }
  if (sagAftraId) {
    affiliations.push('SAG-AFTRA')
  }

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="gap-6 py-4">
        {/* Work Locations */}
        {workLocations.length > 0 && (
          <View className="gap-4">
            <Text variant="labelSm" className="uppercase text-text-low">
              Working Locations
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {workLocations.map((location: string, index: number) => (
                <View
                  key={index}
                  className="rounded-[27px] border border-border-low bg-surface-high px-3 py-2">
                  <Text variant="bodySm" className="text-text-default">
                    {location}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <View className="gap-4">
            <Text variant="labelSm" className="uppercase text-text-low">
              Genres
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {genres.map((genre: string, index: number) => (
                <View
                  key={index}
                  className="rounded-[27px] border border-border-low bg-surface-high px-3 py-2">
                  <Text variant="bodySm" className="text-text-default">
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Affiliations */}
        {affiliations.length > 0 && (
          <View className="gap-4">
            <Text variant="labelSm" className="uppercase text-text-low">
              Affiliations
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {affiliations.map((affiliation: string, index: number) => (
                <View
                  key={index}
                  className="rounded-[27px] border border-border-low bg-surface-high px-3 py-2">
                  <Text variant="bodySm" className="text-text-default">
                    {affiliation}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
