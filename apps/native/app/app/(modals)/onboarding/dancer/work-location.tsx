import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { WorkLocationForm } from '~/components/forms/onboarding/WorkLocationForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { WorkLocationValues } from '~/components/forms/onboarding/WorkLocationForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import type { PlaceKitLocation } from '~/components/ui/location-picker-placekit';

export default function DancerWorkLocationScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);

  const handleSubmit = async (values: WorkLocationValues) => {
    try {
      // Convert PlaceKitLocation array to string array
      const workLocationStrings = values.locations
        .filter((loc): loc is PlaceKitLocation => loc !== null)
        .map((loc) => `${loc.city}, ${loc.state}`);

      await updateDancerProfile({ workLocation: workLocationStrings });
      router.back();
    } catch (error) {
      console.error('Failed to save work locations:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  // Convert workLocation strings to PlaceKitLocation objects for the form
  // Note: This is a simplified conversion - full location data would need to be stored
  const initialLocations: (PlaceKitLocation | null)[] = dancerProfile?.workLocation?.map(
    (locationName) => {
      // Parse "City, State" format
      const parts = locationName.split(', ');
      return {
        city: parts[0] || locationName,
        state: parts[1] || '',
        stateCode: parts[1] || '',
        country: 'US',
      };
    }
  ) || [null];

  return (
    <BaseOnboardingScreen
      title="Work Locations"
      description="Where are you willing to work?"
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <WorkLocationForm
        ref={formRef}
        initialValues={{ locations: initialLocations }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
