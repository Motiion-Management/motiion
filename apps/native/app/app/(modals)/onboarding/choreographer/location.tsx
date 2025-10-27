import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { LocationForm } from '~/components/forms/onboarding/LocationForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { LocationValues } from '~/components/forms/onboarding/LocationForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import type { PlaceKitLocation } from '~/components/ui/location-picker-placekit';

export default function ChoreographerLocationScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load choreographer profile
  const choreographerProfile = useQuery(api.choreographers.getMyChoreographerProfile, {});
  const updateChoreographerProfile = useMutation(api.choreographers.updateMyChoreographerProfile);

  const handleSubmit = async (values: LocationValues) => {
    try {
      if (!values.primaryLocation) return;

      // Convert PlaceKitLocation to location object
      const location = {
        name: values.primaryLocation.city,
        country: values.primaryLocation.country || '',
        state: values.primaryLocation.state || '',
        city: values.primaryLocation.city,
        zipCode: undefined,
        address: `${values.primaryLocation.city}, ${values.primaryLocation.state}`,
      };

      await updateChoreographerProfile({ location });
      router.back();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  if (choreographerProfile === undefined) {
    return null; // Loading state
  }

  // Convert location object to PlaceKitLocation for the form
  const initialLocation: PlaceKitLocation | null = choreographerProfile?.location
    ? {
        city: choreographerProfile.location.city,
        state: choreographerProfile.location.state,
        stateCode: choreographerProfile.location.state,
        country: choreographerProfile.location.country,
      }
    : null;

  return (
    <BaseOnboardingScreen
      title="Location"
      description="Where are you based?"
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <LocationForm
        ref={formRef}
        initialValues={{ primaryLocation: initialLocation }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
