import React, { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Text } from '~/components/ui/text';
import { Chips } from '~/components/ui/chips/chips';
import { Input } from '~/components/ui/input';

export default function SkillsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dancer profile with skills and genres data
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  );

  // Filter genres and skills based on search
  const { filteredGenres, filteredSkills } = useMemo(() => {
    const genres = profileData?.dancer.genres || [];
    const skills = profileData?.dancer.skills || [];

    if (!searchQuery.trim()) {
      return { filteredGenres: genres, filteredSkills: skills };
    }

    const query = searchQuery.toLowerCase();
    return {
      filteredGenres: genres.filter((genre: string) => genre.toLowerCase().includes(query)),
      filteredSkills: skills.filter((skill: string) => skill.toLowerCase().includes(query)),
    };
  }, [profileData?.dancer.genres, profileData?.dancer.skills, searchQuery]);

  const hasGenres = filteredGenres.length > 0;
  const hasSkills = filteredSkills.length > 0;
  const hasAnyResults = hasGenres || hasSkills;

  if (!id) {
    return null;
  }

  return (
    <View className="flex-1 gap-6 bg-background-gradient-filled py-6">
      {/* Search Input */}
      <Input
        placeholder="Search skills and genres..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerClassName="px-4"
      />

      {/* Skills and Genres Display */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-8 pb-8">
          {profileData === undefined ? (
            <View className="py-8">
              <Text variant="body" className="text-center text-text-low">
                Loading skills...
              </Text>
            </View>
          ) : !hasAnyResults ? (
            <View className="py-8">
              <Text variant="body" className="text-center text-text-low">
                {searchQuery.trim() ? 'No skills or genres match your search' : 'No skills or genres found'}
              </Text>
            </View>
          ) : (
            <>
              {/* Genres Section */}
              {hasGenres && (
                <View className="gap-4">
                  <Text variant="header5" className="text-text-low">
                    GENRES
                  </Text>
                  <Chips variant="filter" items={filteredGenres} />
                </View>
              )}

              {/* Special Skills Section */}
              {hasSkills && (
                <View className="gap-4">
                  <Text variant="header5" className="text-text-low">
                    SPECIAL SKILLS
                  </Text>
                  <Chips variant="filter" items={filteredSkills} />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
