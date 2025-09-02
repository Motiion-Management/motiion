import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { LocationPicker, type PlaceKitLocation } from '~/components/ui/location-picker-placekit';
import { useLocationForm } from '~/hooks/useLocationForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

export interface LocationValues {
  primaryLocation: PlaceKitLocation | null;
}

export const LocationForm = forwardRef<FormHandle, FormProps<LocationValues>>(function LocationForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useLocationForm({
    initialValue: initialValues.primaryLocation,
    onSubmit: async (data) => {
      if (!data.primaryLocation) return;
      await onSubmit({ primaryLocation: data.primaryLocation });
    },
  });

  useImperativeHandle(ref, () => ({
    submit: () => form.actions.submit(),
    isDirty: () => false, // local-only form; not tracking dirtiness here
    isValid: () => form.isValid && !form.isSubmitting,
  }));

  useEffect(() => {
    onValidChange?.(form.isValid && !form.isSubmitting);
  }, [form.isValid, form.isSubmitting, onValidChange]);

  return (
    <View className="w-full">
      <LocationPicker
        value={form.data.primaryLocation}
        onValueChange={form.actions.setLocation}
        error={form.errors.primaryLocation}
      />
    </View>
  );
});
