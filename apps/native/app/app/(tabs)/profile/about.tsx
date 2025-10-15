import React, { useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { DancerDoc } from '@packages/backend/convex/schemas/dancers';
import type { ChoreographerDoc } from '@packages/backend/convex/schemas/choreographers';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { DisplayNameForm } from '~/components/forms/onboarding/DisplayNameForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { DisplayNameValues } from '~/components/forms/onboarding/DisplayNameForm';
import { useUser } from '~/hooks/useUser';
import { Icon } from '~/lib/icons/Icon';

export default function AboutScreen() {
  const { user } = useUser();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load active profile based on user's active profile type
  const dancerProfile = useQuery(
    api.dancers.getMyDancerProfile,
    user?.activeProfileType === 'dancer' ? {} : 'skip'
  );
  const choreographerProfile = useQuery(
    api.choreographers.getMyChoreographerProfile,
    user?.activeProfileType === 'choreographer' ? {} : 'skip'
  );

  // Mutations for both profile types
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);
  const updateChoreographerProfile = useMutation(api.choreographers.updateMyChoreographerProfile);

  // Get the active profile based on user's active profile type
  const activeProfile = (user?.activeProfileType === 'dancer'
    ? dancerProfile
    : choreographerProfile) as DancerDoc | ChoreographerDoc | null | undefined;
  const displayName: string = activeProfile?.displayName || user?.fullName || 'Not set';

  const handleEdit = () => {
    bottomSheetRef.current?.present();
  };

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleSubmit = async (values: DisplayNameValues) => {
    try {
      if (user?.activeProfileType === 'dancer') {
        await updateDancerProfile({ displayName: values.displayName.trim() });
      } else if (user?.activeProfileType === 'choreographer') {
        await updateChoreographerProfile({ displayName: values.displayName.trim() });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to update display name:', error);
    }
  };

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'About',
      }}>
      <View className="flex-1 p-4">
        {/* Display Name Section */}
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-row items-center justify-between rounded-lg border border-border-default bg-surface-default p-4">
          <View className="flex-1">
            <Text variant="bodySm" className="text-text-low">
              Display Name
            </Text>
            <Text variant="body" className="mt-1 text-text-default">
              {displayName}
            </Text>
          </View>
          <Icon name="chevron.right" size={20} className="text-icon-low" />
        </TouchableOpacity>

        <Text variant="bodySm" className="mt-2 px-4 text-text-low">
          This is how your name appears on your profile
        </Text>
      </View>

      {/* Edit Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing
        backdropComponent={(props) => (
          <TouchableOpacity
            {...props}
            style={[props.style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
            activeOpacity={1}
            onPress={handleClose}
          />
        )}>
        <BottomSheetView className="p-6">
          <View className="mb-4">
            <Text variant="header4" className="text-text-default">
              Edit Display Name
            </Text>
          </View>

          <DisplayNameForm
            ref={formRef}
            initialValues={{ displayName: activeProfile?.displayName || '' }}
            onSubmit={handleSubmit}
            onValidChange={setCanSubmit}
          />

          <View className="mt-6 flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={handleClose}>
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="accent"
              className="flex-1"
              disabled={!canSubmit}
              onPress={() => formRef.current?.submit()}>
              <Text>Save</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </TabScreenLayout>
  );
}
