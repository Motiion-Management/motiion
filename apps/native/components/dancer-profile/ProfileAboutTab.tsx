import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { Text } from '~/components/ui/text';
import { ProjectCarousel } from './ProjectCarousel';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { TypecastDetails } from './TypecastDetails';

interface ProfileAboutTabProps {
  profileData: DancerProfileData;
}

export function ProfileAboutTab({ profileData }: ProfileAboutTabProps) {
  const { dancer, recentProjects, agency } = profileData;
  const workLocations = dancer.workLocation || [];
  const genres = dancer.genres || [];
  const representation = dancer.representation;
  const sagAftraId = dancer.sagAftraId;

  const affiliations = [];
  if (representation?.agencyId && agency?.name) {
    affiliations.push(agency.name);
  }
  if (sagAftraId) {
    affiliations.push('SAG-AFTRA');
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Accordion type="single" defaultValue={'profile'} className="gap-0">
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
        <AccordionItem value="typecast">
          <AccordionTrigger>
            <Text variant="header4">Typecast</Text>
          </AccordionTrigger>
          <AccordionContent>
            <TypecastDetails dancer={profileData.dancer} />
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
