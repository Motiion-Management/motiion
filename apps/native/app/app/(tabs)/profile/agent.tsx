import React from 'react';
import { View, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { Text } from '~/components/ui/text';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { AgentForm, type AgentValues } from '~/components/forms/onboarding/AgentForm';

export default function AgentScreen() {
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);

  const handleSave = async (values: AgentValues) => {
    try {
      await updateDancerProfile({
        representation: values.representation,
      });
    } catch (error) {
      console.error('Failed to save agent information:', error);
    }
  };

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Agent',
      }}>
      <View className="flex-1 px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Description text */}
          <Text variant="body" className="mb-8 text-text-low">
            Add your agency or management representation information
          </Text>

          <View className="gap-8">
            {/* Agent form - auto-saves on change */}
            <AgentForm
              initialValues={{
                representation: dancerProfile?.representation || {},
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
