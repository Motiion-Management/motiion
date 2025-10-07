import React from 'react'
import { View, ScrollView } from 'react-native'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '~/components/ui/accordion'
import { Text } from '~/components/ui/text'
import { MediaCard } from '~/components/ui/media-card'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'
import { getProjectDisplayTitle } from '~/config/projectTypes'

interface ProfileAboutTabProps {
  dancer: Doc<'dancers'>
  recentProjects: Array<any>
}

export function ProfileAboutTab({ dancer, recentProjects }: ProfileAboutTabProps) {
  const workLocations = dancer.workLocation || []
  const genres = dancer.genres || []
  const representation = dancer.representation
  const sagAftraId = dancer.sagAftraId

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <Accordion type="multiple" defaultValue={['profile']} className="gap-0">
        {/* Profile Section */}
        <AccordionItem value="profile">
          <AccordionTrigger>
            <Text>Profile</Text>
          </AccordionTrigger>
          <AccordionContent>
            <View className="gap-4">
              {/* Work Locations */}
              {workLocations.length > 0 && (
                <View className="gap-2">
                  <Text variant="labelSm" className="text-text-low">
                    Working Locations
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {workLocations.map((location: string, index: number) => (
                      <View
                        key={index}
                        className="rounded-full border border-border-default bg-surface-high px-3 py-1">
                        <Text variant="bodyXs">{location}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Genres */}
              {genres.length > 0 && (
                <View className="gap-2">
                  <Text variant="labelSm" className="text-text-low">
                    Genres
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {genres.map((genre: string, index: number) => (
                      <View
                        key={index}
                        className="rounded-full border border-border-default bg-surface-high px-3 py-1">
                        <Text variant="bodyXs">{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Representation/Affiliations */}
              {(representation || sagAftraId) && (
                <View className="gap-2">
                  <Text variant="labelSm" className="text-text-low">
                    Affiliations
                  </Text>
                  <View className="gap-1">
                    {representation?.agencyId && (
                      <Text variant="body" className="text-text-low">
                        Agency Represented
                      </Text>
                    )}
                    {sagAftraId && (
                      <Text variant="body" className="text-text-low">
                        SAG-AFTRA Member
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </AccordionContent>
        </AccordionItem>

        {/* Highlights Section */}
        <AccordionItem value="highlights">
          <AccordionTrigger>
            <Text>Highlights</Text>
          </AccordionTrigger>
          <AccordionContent>
            {recentProjects.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {recentProjects.slice(0, 2).map((project, index) => (
                  <View key={project._id} style={{ width: '48%' }}>
                    <MediaCard
                      label={
                        project.type === 'tv-film'
                          ? 'TV/FILM'
                          : project.type === 'music-video'
                            ? 'MUSIC VIDEO'
                            : project.type === 'live-performance'
                              ? 'LIVE'
                              : 'COMMERCIAL'
                      }
                      title={getProjectDisplayTitle(project)}
                      backgroundColor={index === 0 ? '#ff6b35' : '#4ecdc4'}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="body" className="text-text-low">
                No projects yet
              </Text>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Socials Section */}
        <AccordionItem value="socials">
          <AccordionTrigger>
            <Text>Socials</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text variant="body" className="text-text-low">
              Social links will be displayed here
            </Text>
            {/* TODO: Implement social links display when links data is available */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollView>
  )
}
