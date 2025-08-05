import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React from 'react';
import { View, ScrollView, Pressable, Keyboard } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { WorkLocationPicker } from '~/components/ui/work-location-picker';
import { useWorkLocationForm } from '~/hooks/useWorkLocationForm';
import { OnboardingScreenWrapper } from '~/components/onboarding/OnboardingScreenWrapper';

export default function WorkLocationScreen() {
  return <OnboardingScreenWrapper v1Component={WorkLocationScreenV1} screenName="work-location" />;
}

function WorkLocationScreenV1() {
  const updateUser = useMutation(api.users.updateMyUser);
  const user = useQuery(api.users.getMyUser);

  // Get primary location from previous step
  const primaryLocation = user?.location
    ? {
      city: user.location.city || '',
      state: user.location.state || '',
      stateCode: user.location.state || '',
      country: user.location.country || 'United States',
    }
    : null;

  // Convert existing work locations back to PlaceKitLocation format
  const existingWorkLocations =
    user?.workLocation?.map((locationString) => {
      const [city, state] = locationString.split(', ');
      return {
        city,
        state,
        stateCode: state,
        country: 'United States',
      };
    }) || [];

  const workLocationForm = useWorkLocationForm({
    primaryLocation,
    existingWorkLocations,
    onSubmit: async (data) => {
      // Convert locations to array of strings for the backend
      const workLocations = data.locations
        .filter(Boolean)
        .map((location) => `${location!.city}, ${location!.state}`);

      await updateUser({
        workLocation: workLocations,
      });
    },
  });

  return (
    <BaseOnboardingScreen
      title="Where can you work as a local?"
      canProgress={workLocationForm.isValid}
      primaryAction={{
        onPress: workLocationForm.actions.submit,
        disabled: !workLocationForm.isValid || workLocationForm.isSubmitting,
      }}
      secondaryAction={
        workLocationForm.canAddMore
          ? {
            text: 'Add a location',
            onPress: workLocationForm.actions.addLocation,
          }
          : undefined
      }>
      <Pressable className="w-full flex-1" onPress={Keyboard.dismiss}>
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 300 }}
          style={{ overflow: 'visible' }}>
          <View className="gap-6" style={{ overflow: 'visible' }}>
            {/* Location inputs */}
            {workLocationForm.data.locations.map((location, index) => (
              <WorkLocationPicker
                key={index}
                index={index}
                value={location}
                onValueChange={(newLocation) =>
                  workLocationForm.actions.setLocation(index, newLocation)
                }
                onRemove={() => workLocationForm.actions.removeLocation(index)}
                excludeLocations={workLocationForm.selectedLocations.filter((_, i) => i !== index)}
                error={workLocationForm.errors.locations?.[index]}
              />
            ))}
          </View>
        </ScrollView>
      </Pressable>
    </BaseOnboardingScreen>
  );
}
