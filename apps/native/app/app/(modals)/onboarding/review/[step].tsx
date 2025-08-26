import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import type { FormHandle } from '~/components/forms/onboarding/contracts';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { BaseFormContainer } from '~/components/onboarding/BaseFormContainer';
import X from '~/lib/icons/X';
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

export default function ReviewEditModal() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const def = step ? (STEP_REGISTRY as any)[step] : undefined;

  const formRef = useRef<FormHandle>(null);
  const { data, isLoading } = useOnboardingData();
  // Convex mutations for save context
  const updateMyUser = useMutation(api.users.updateMyUser)
  const patchUserAttributes = useMutation(api.users.patchUserAttributes)
  const updateMyResume = useMutation(api.users.resume.updateMyResume)
  const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation)

  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    if (!def || isLoading) return null;
    return def.getInitialValues(data);
  }, [def, data, isLoading]);

  const handleClose = () => {
    if (!isSubmitting) router.back();
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await Promise.resolve(
        def?.save?.(values, {
          data,
          updateMyUser,
          patchUserAttributes,
          updateMyResume,
          addMyRepresentation,
        })
      );
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!def) return null;
  const FormComponent = def.Component as any;

  return (
    <>
      <Stack.Screen />
      <View className="flex-1 bg-surface-default">
        {/* Close */}
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View className="absolute right-2 top-2 z-10">
            <Button size="icon" variant="plain" onPress={handleClose}>
              <X size={24} className="color-icon-default" />
            </Button>
          </View>
        </SafeAreaView>

        <View style={{ paddingTop: 48 }} className="flex-1">
          {!isLoading && initialValues && (
            <BaseFormContainer
              title={def.title}
              description={def.description}
              gradientBackground={false}
              padTop={false}
            >
              <FormComponent
                ref={formRef}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onValidChange={setCanSubmit}
              />
            </BaseFormContainer>
          )}
        </View>

        {/* Save Footer (unchanged layout) */}
        <SafeAreaView edges={['bottom', 'left', 'right']}>
          <View className="border-t border-border-default bg-surface-default px-4 py-4">
            <Button
              disabled={!canSubmit || isSubmitting}
              size="lg"
              className="w-full"
              onPress={() => formRef.current?.submit()}>
              <Text>Save</Text>
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
