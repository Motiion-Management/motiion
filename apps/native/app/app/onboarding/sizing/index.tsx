import React from 'react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { SizingSection } from '~/components/sizing/SizingSection';

export default function SizingScreen() {
  return (
    <BaseOnboardingScreen
      title="Size Card"
      description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
      canProgress // Always true - all fields are optional
      primaryAction={{
        onPress: () => { },
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
  );
}
