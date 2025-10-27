import React from 'react';
import { ScrollView } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { SizingSection } from '~/components/sizing/SizingSection';

export default function SizesScreen() {
  // Load dancer profile for sizing data
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Sizes',
      }}>
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <SizingSection title="General" metrics={['waist', 'inseam', 'glove', 'hat']} />
        <SizingSection
          title="Men"
          metrics={['chest', 'neck', 'sleeve', 'maleShirt', 'maleShoes', 'maleCoatLength']}
        />
        <SizingSection
          title="Women"
          metrics={[
            'dress',
            'bust',
            'underbust',
            'cup',
            'hip',
            'femaleShirt',
            'pants',
            'femaleShoes',
            'femaleCoatLength',
          ]}
        />
      </ScrollView>
    </TabScreenLayout>
  );
}
