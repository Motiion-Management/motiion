import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';

const TRAINING_TYPE_LABELS: Record<string, string> = {
  'education': 'Education',
  'dance-school': 'Dance School',
  'programs-intensives': 'Programs & Intensives',
  'scholarships': 'Scholarships',
  'other': 'Other'
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TrainingDetailScreen() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();

  // Fetch training record
  const training = useQuery(
    api.training.read,
    trainingId ? { id: trainingId as Id<'training'> } : 'skip'
  );

  if (training === undefined) {
    return null; // Loading
  }

  if (training === null) {
    return <Redirect href="../" />;
  }

  const trainingType = training.type ? TRAINING_TYPE_LABELS[training.type] : 'Training';
  const yearRange = training.startYear && training.endYear
    ? `${training.startYear} - ${training.endYear}`
    : training.startYear
    ? `${training.startYear}`
    : undefined;

  return (
    <View className="flex-1 bg-background-gradient-filled">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-8 px-6 py-6">
          {/* Title */}
          <Text variant="header3" className="text-text-default">
            {training.degree || training.institution || 'Training'}
          </Text>

          {/* Main Details */}
          <View className="gap-6">
            {/* Training Type */}
            <View className="gap-4">
              <Text variant="labelSm" className="uppercase text-text-low">
                Type
              </Text>
              <View className="h-px w-full bg-border-tint" />
              <Text variant="body" className="text-text-default">
                {trainingType}
              </Text>
            </View>

            {/* Institution */}
            {training.institution && (
              <View className="gap-4">
                <Text variant="labelSm" className="uppercase text-text-low">
                  Institution
                </Text>
                <View className="h-px w-full bg-border-tint" />
                <Text variant="body" className="text-text-default">
                  {training.institution}
                </Text>
              </View>
            )}

            {/* Degree/Program */}
            {training.degree && (
              <View className="gap-4">
                <Text variant="labelSm" className="uppercase text-text-low">
                  Degree/Program
                </Text>
                <View className="h-px w-full bg-border-tint" />
                <Text variant="body" className="text-text-default">
                  {training.degree}
                </Text>
              </View>
            )}

            {/* Year Range */}
            {yearRange && (
              <View className="gap-4">
                <Text variant="labelSm" className="uppercase text-text-low">
                  Years Attended
                </Text>
                <View className="h-px w-full bg-border-tint" />
                <Text variant="body" className="text-text-default">
                  {yearRange}
                </Text>
              </View>
            )}

            {/* Instructors */}
            {training.instructors && training.instructors.length > 0 && (
              <View className="gap-4">
                <Text variant="labelSm" className="uppercase text-text-low">
                  Instructors
                </Text>
                <View className="h-px w-full bg-border-tint" />
                <View className="gap-3">
                  {training.instructors.map((name: string, index: number) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <Avatar alt={`Avatar for ${name}`} className="h-8 w-8">
                        <AvatarFallback>
                          <Text variant="bodySm" className="text-text-default">
                            {getInitials(name)}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <Text variant="body" className="text-text-default">
                        {name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
