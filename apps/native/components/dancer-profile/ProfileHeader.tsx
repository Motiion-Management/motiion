import React from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import { Text } from '~/components/ui/text'
import { MediaCard } from '~/components/ui/media-card'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'
import { getProjectDisplayTitle, getProjectDisplaySubtitle } from '~/config/projectTypes'

interface ProfileHeaderProps {
  dancer: Doc<'dancers'>
  headshotUrl?: string | null
  recentProjects: Array<any>
  onHeadshotPress?: () => void
}

export function ProfileHeader({
  dancer,
  headshotUrl,
  recentProjects,
  onHeadshotPress
}: ProfileHeaderProps) {
  const displayName = dancer.displayName || 'Dancer'
  const workLocation = dancer.workLocation?.[0] || null

  return (
    <View className="items-center gap-6">
      {/* Headshot */}
      <TouchableOpacity
        onPress={onHeadshotPress}
        disabled={!onHeadshotPress}
        className="h-32 w-32 overflow-hidden rounded-full border-2 border-border-default bg-surface-high">
        {headshotUrl ? (
          <Image
            source={{ uri: headshotUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text variant="bodyXs" className="text-text-low">
              No photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name and Location */}
      <View className="items-center gap-1">
        <Text variant="header3" className="font-semibold">
          {displayName}
        </Text>
        {workLocation && (
          <Text variant="body" className="text-text-low">
            {workLocation}
          </Text>
        )}
      </View>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <View className="w-full flex-row gap-3">
          {recentProjects.slice(0, 2).map((project, index) => (
            <View key={project._id} className="flex-1">
              <MediaCard
                label={
                  project.type === 'tv-film'
                    ? 'TV/FILM'
                    : project.type === 'music-video'
                      ? 'MUSIC VIDEO'
                      : project.type === 'live-performance'
                        ? 'LIVE PERFORMANCE'
                        : 'COMMERCIAL'
                }
                title={getProjectDisplayTitle(project)}
                backgroundColor={index === 0 ? '#ff6b35' : '#4ecdc4'}
              />
            </View>
          ))}
          {recentProjects.length === 1 && (
            <View className="flex-1">
              <MediaCard
                label="ADD PROJECT"
                title="Featured Work"
                backgroundColor="#95a5a6"
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}
