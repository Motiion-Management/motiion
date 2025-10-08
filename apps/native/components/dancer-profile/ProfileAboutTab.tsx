import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { Text } from '~/components/ui/text';
import { MediaCard } from '~/components/ui/media-card';
import { type Doc } from '@packages/backend/convex/_generated/dataModel';
import { getProjectDisplayTitle } from '~/config/projectTypes';

interface ProfileAboutTabProps {
  dancer: Doc<'dancers'>;
  recentProjects: Array<any>;
}

export function ProfileAboutTab({ dancer, recentProjects }: ProfileAboutTabProps) {
  const workLocations = dancer.workLocation || [];
  const genres = dancer.genres || [];
  const representation = dancer.representation;
  const sagAftraId = dancer.sagAftraId;

  const affiliations = [];
  if (representation?.agencyId) {
    affiliations.push('Bloc Talent Agency'); // TODO: Get actual agency name
  }
  if (sagAftraId) {
    affiliations.push('SAG-AFTRA');
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Accordion type="multiple" defaultValue={['profile']} className="gap-0">
        {/* Profile Section */}
        <AccordionItem value="profile">
          <AccordionTrigger>
            <Text variant="header4">Profile</Text>
          </AccordionTrigger>
          <AccordionContent>
            <View className="gap-6">
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
                        className="rounded-[27px] border border-border-tint bg-surface-high px-3 py-2">
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
          </AccordionContent>
        </AccordionItem>

        {/* Highlights Section */}
        <AccordionItem value="highlights">
          <AccordionTrigger>
            <Text variant="header4">Highlights</Text>
          </AccordionTrigger>
          <AccordionContent>
            <View className="px-4">
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
            </View>
          </AccordionContent>
        </AccordionItem>

        {/* Socials Section */}
        <AccordionItem value="socials">
          <AccordionTrigger>
            <Text variant="header4" className="text-text-low">
              Socials
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <View className="px-4">
              <Text variant="body" className="text-text-low">
                Social links will be displayed here
              </Text>
              {/* TODO: Implement social links display when links data is available */}
            </View>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollView>
  );
}
