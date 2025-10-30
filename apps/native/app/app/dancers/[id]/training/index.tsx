import React, { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Text } from '~/components/ui/text';
import { ListItem } from '~/components/ui/list-item';
import { Input } from '~/components/ui/input';

export default function TrainingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dancer profile with training data
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  );

  // Filter training based on search
  const filteredTraining = useMemo(() => {
    if (!profileData?.training) return [];
    if (!searchQuery.trim()) return profileData.training;

    const query = searchQuery.toLowerCase();
    return profileData.training.filter((item: any) => {
      const school = item.school?.toLowerCase() || '';
      const program = item.program?.toLowerCase() || '';
      const degree = item.degree?.toLowerCase() || '';

      return school.includes(query) || program.includes(query) || degree.includes(query);
    });
  }, [profileData?.training, searchQuery]);

  if (!id) {
    return null;
  }

  return (
    <View className="flex-1 gap-6 bg-background-gradient-filled py-6">
      {/* Search Input */}
      <Input
        placeholder="Search training..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerClassName="px-4"
      />

      {/* Training List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {profileData === undefined ? (
            <View className="py-8">
              <Text variant="body" className="text-center text-text-low">
                Loading training...
              </Text>
            </View>
          ) : filteredTraining.length === 0 ? (
            <View className="py-8">
              <Text variant="body" className="text-center text-text-low">
                {searchQuery.trim() ? 'No training records match your search' : 'No training records found'}
              </Text>
            </View>
          ) : (
            filteredTraining.map((training: any, index: number) => {
              const organizer = training.school || 'Unknown Institution';
              const title = training.program || training.degree || 'Training Program';

              return (
                <ListItem
                  key={`${training.school}-${index}`}
                  variant="Experience"
                  organizer={organizer}
                  title={title}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
