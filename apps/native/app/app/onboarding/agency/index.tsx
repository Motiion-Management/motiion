import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { useStore } from '@tanstack/react-form';
import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';
import { BottomSheetComboboxField } from '~/components/form/BottomSheetComboboxField';
import { useConvex } from 'convex/react';

const agencyValidator = z.object({
  agencyId: z.string().min(1, 'Please select an agency'),
});

interface AgencyResult {
  _id: string;
  name: string;
  shortName?: string;
  location?: {
    city: string;
    state: string;
  };
}

export default function AgencySelectionScreen() {
  const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation);

  const { user } = useUser();
  const convex = useConvex();

  const form = useAppForm({
    defaultValues: {
      agencyId: user?.representation?.agencyId || '',
    },
    validators: {
      onChange: agencyValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.agencyId) {
          await addMyRepresentation({ agencyId: value.agencyId as any });
        }
        router.push('/app/onboarding/resume'); // Navigate to next step
      } catch (error) {
        console.error('Error saving agency:', error);
      }
    },
  });

  const canProgress = useStore(form.store, (s) => !!s.values.agencyId && s.canSubmit);

  return (
    <BaseOnboardingScreen
      title="Select Agency"
      description="Search and select your representation agency"
      canProgress={canProgress}
      primaryAction={{
        onPress: () => form.handleSubmit(),
        handlesNavigation: true,
      }}>
      <ValidationModeForm form={form}>
        <View className="gap-4">
          <form.AppField
            name="agencyId"
            children={(field) => (
              <field.BottomSheetComboboxField
                label="Agency"
                placeholder="Search for your agency..."
                data={[]}
                onSearchAsync={async (term: string) => {
                  if (!term) return [] as any;
                  const results = await convex.query(api.agencies.search, { query: term });
                  return results.map((a: AgencyResult) => ({
                    value: a._id,
                    label: a.location
                      ? `${a.name} — ${a.location.city}, ${a.location.state}`
                      : a.name,
                  }));
                }}
                getLabelAsync={async (id: string) => {
                  if (!id) return null as any;
                  const agency = await convex.query(api.agencies.getAgency, { id: id as any });
                  if (!agency) return null as any;
                  return agency.location
                    ? `${agency.name} — ${agency.location.city}, ${agency.location.state}`
                    : agency.name;
                }}
              />
            )}
          />
          {/* Optional: message when a user wants to add a new agency can go here */}
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
