// @ts-nocheck
import { api } from '@packages/backend/convex/_generated/api';
import { BottomSheet } from '@expo/ui/swift-ui';
import { useMutation, useQuery } from 'convex/react';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { sizingValidator } from '~/components/form/SizingValidator';
import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { SizingSection } from '~/components/sizing/SizingSection';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

export default function SizingScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const user = useQuery(api.users.getMyUser);
  const cursor = useOnboardingCursor();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);
  const handleBottomSheetOpen = () => {
    console.log('🎯 Bottom sheet opened');
    setIsBottomSheetOpen(true);
  };
  const handleBottomSheetClose = () => {
    console.log('🎯 Bottom sheet closed');
    setIsBottomSheetOpen(false);
  };

  const handleBottomSheetChange = (isOpen: boolean) => {
    console.log(`🎯 Bottom sheet state changed: ${isOpen ? 'Opened' : 'Closed'}`);
    setIsBottomSheetOpen(isOpen);
  };

  const form = useAppForm({
    defaultValues: {
      general: user?.sizing?.general || {},
      male: user?.sizing?.male || {},
      female: user?.sizing?.female || {},
    },
    validators: {
      onChange: sizingValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUser({
          sizing: value,
        });

        // Navigate to next step using cursor-based navigation
        cursor.goToNextStep();
      } catch (error) {
        console.error('Error updating sizing:', error);
      }
    },
  });

  return (
    <OnboardingStepGuard requiredStep="sizing">
      <View className="h-screen bg-black">
        <BaseOnboardingScreen
          title="Size Card"
          description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
          canProgress // Always true - all fields are optional
          primaryAction={{
            onPress: () => form.handleSubmit(),
          }}>
          <ValidationModeForm form={form}>
            {/* Reanimated Test Section */}
            <View className="m-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleBottomSheetOpen}
                  className="rounded-lg bg-blue-500 p-3">
                  <Text className="text-center font-semibold text-white">Open Custom Sheet</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}>
              <SizingSection
                title="General"
                metrics={['waist', 'inseam', 'glove', 'hat']}
                form={form}
              />
              <SizingSection
                title="Men"
                metrics={['chest', 'neck', 'sleeve', 'maleShirt', 'maleShoes', 'maleCoatLength']}
                form={form}
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
                form={form}
              />
            </ScrollView>
          </ValidationModeForm>
        </BaseOnboardingScreen>

        <BottomSheet isOpened={isBottomSheetOpen} onIsOpenedChange={handleBottomSheetChange}>
          <View className="p-6">
            <Text className="mb-4 text-center text-xl font-bold">🎉 Bottom Sheet Example</Text>
            <Text className="mb-4 text-gray-600">
              This is a simple bottom sheet example using Expo's SwiftUI components.
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={handleBottomSheetClose}
                className="rounded-lg bg-gray-500 p-3">
                <Text className="text-center font-semibold text-white">Close Bottom Sheet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </View>
    </OnboardingStepGuard>
  );
}
