import { api } from '@packages/backend/convex/_generated/api';
import { HAIRCOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import * as z from 'zod';
import { View } from 'react-native';
import { CheckCircle2, Loader2 } from 'lucide-react-native';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { useAutoSaveAppForm } from '~/hooks/useAutoSaveAppForm';
import { Text } from '~/components/ui/text';

const hairColorValidator = z.object({
  hairColor: z.enum(HAIRCOLOR, {
    required_error: 'Please select a hair color',
  }),
});

type HairColor = (typeof HAIRCOLOR)[number];

export default function HairColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const cursor = useOnboardingCursor();

  const form = useAutoSaveAppForm<{ hairColor: HairColor | undefined }>({
    defaultValues: {
      hairColor: undefined,
    },
    validators: {
      onChange: hairColorValidator,
    },
    // Auto-save configuration
    autoSave: {
      debounceMs: 500, // Save 500ms after user stops selecting
      fieldMapping: {
        hairColor: 'attributes.hairColor', // Map form field to nested Convex field
      },
    },
    onSubmit: async (props) => {
      // Since we're auto-saving, submit just navigates to next step
      // The data is already saved
      const value = props.value as { hairColor: HairColor | undefined };
      if (!value.hairColor) return;
    },
  });

  const radioOptions = HAIRCOLOR.map((color) => ({
    value: color,
    label: color,
  }));

  return (
    <OnboardingStepGuard requiredStep="hair-color">
      <BaseOnboardingScreen
        title="What color is your hair?"
        description="Select one"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <View className="relative">
          <ValidationModeForm form={form}>
            <form.AppField
              name="hairColor"
              children={(field) => <field.RadioGroupField options={radioOptions} />}
            />
          </ValidationModeForm>

          {/* Auto-save indicator */}
          {form.autoSave.showIndicators && (
            <View className="absolute -top-6 right-0 flex-row items-center gap-1">
              {form.autoSave.isSaving && (
                <>
                  <Loader2 size={14} className="animate-spin text-text-low" />
                  <Text variant="footnote" className="text-text-low">
                    Saving...
                  </Text>
                </>
              )}

              {!form.autoSave.isSaving && form.autoSave.saveState.lastSaved && (
                <>
                  <CheckCircle2 size={14} className="text-accent" />
                  <Text variant="footnote" className="text-accent">
                    Saved
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
