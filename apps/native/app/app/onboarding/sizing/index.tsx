import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { SizingSection } from '~/components/sizing/SizingSection';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

export default function SizingScreen() {
  const cursor = useOnboardingCursor();

  return (
    <View className="h-full w-full flex-1 items-center justify-center">
      <BaseOnboardingScreen
        title="Size Card"
        description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
        canProgress // Always true - all fields are optional
        primaryAction={{
          onPress: () => {},
        }}>
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
      </BaseOnboardingScreen>
    </View>
  );
}
