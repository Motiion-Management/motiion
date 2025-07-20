// @ts-nocheck
// import { Button } from '@expo/ui/swift-ui';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';

import { sizingValidator } from '~/components/form/SizingValidator';
import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { SizingSection } from '~/components/sizing/SizingSection';
import { Button } from '~/components/ui/button';
import { Sheet, SheetAction } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
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
    <View className="h-full w-full flex-1 items-center justify-center p-4">
      <BaseOnboardingScreen
        title="Size Card"
        description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
        canProgress // Always true - all fields are optional
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          {/* Reanimated Test Section */}
          <Button onPress={handleBottomSheetOpen}>
            <Text className="">Open Custom Sheet</Text>
          </Button>

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
        </ValidationModeForm>

        <Sheet
          isOpened={isBottomSheetOpen}
          onIsOpenedChange={handleBottomSheetChange}
          actions={[
            {
              onPress: handleBottomSheetClose,
              slot: 'Close',
            },
          ]}>
          <View className="flex-1 p-6">
            <Text className="mb-4 text-center text-xl font-bold">🎉 Bottom Sheet Example</Text>
            <Text className="mb-4 text-gray-600">
              This is a simple bottom sheet example using Expo's SwiftUI components.
            </Text>
            <SheetAction onPress={handleBottomSheetClose}>Close Bottom Sheet</SheetAction>
          </View>
        </Sheet>
      </BaseOnboardingScreen>
    </View>
  );
}
