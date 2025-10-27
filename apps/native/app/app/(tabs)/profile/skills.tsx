import React from 'react';
import { View, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { Text } from '~/components/ui/text';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { SkillsForm, type SkillsValues } from '~/components/forms/onboarding/SkillsForm';

export default function SkillsScreen() {
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);

  const handleSave = async (values: SkillsValues) => {
    try {
      await updateDancerProfile({
        skills: values.skills,
        genres: values.genres,
      });
    } catch (error) {
      console.error('Failed to save skills:', error);
    }
  };

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Skills',
      }}>
      <View className="flex-1 px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Description text */}
          <Text variant="body" className="mb-8 text-text-low">
            What genre and special skills are you proficient in?
          </Text>

          <View className="gap-8">
            {/* Skills form - auto-saves on change */}
            <SkillsForm
              initialValues={{
                genres: dancerProfile?.genres || [],
                skills: dancerProfile?.skills || [],
              }}
              onSubmit={handleSave}
              onValidChange={() => {}}
            />
          </View>
        </ScrollView>
      </View>
    </TabScreenLayout>
  );
}
