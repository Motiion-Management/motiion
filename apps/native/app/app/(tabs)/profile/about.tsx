import React, { useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import type { DancerDoc } from '@packages/backend/convex/schemas/dancers';
import type { ChoreographerDoc } from '@packages/backend/convex/schemas/choreographers';

import { Text } from '~/components/ui/text';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { TabbedView } from '~/components/ui/tabs/TabbedView';
import { FieldEditSheet } from '~/components/profile/FieldEditSheet';
import { DisplayNameForm } from '~/components/forms/onboarding/DisplayNameForm';
import { HeightForm } from '~/components/forms/onboarding/HeightForm';
import { EthnicityForm } from '~/components/forms/onboarding/EthnicityForm';
import { HairColorForm } from '~/components/forms/onboarding/HairColorForm';
import { EyeColorForm } from '~/components/forms/onboarding/EyeColorForm';
import { GenderForm } from '~/components/forms/onboarding/GenderForm';
import { WorkLocationForm } from '~/components/forms/onboarding/WorkLocationForm';
import { UnionForm } from '~/components/forms/onboarding/UnionForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { DisplayNameValues } from '~/components/forms/onboarding/DisplayNameForm';
import type { HeightValues } from '~/components/forms/onboarding/HeightForm';
import type { WorkLocationValues } from '~/components/forms/onboarding/WorkLocationForm';
import type { UnionValues } from '~/components/forms/onboarding/UnionForm';
import type { PlaceKitLocation } from '~/components/ui/location-picker-placekit';
import { useUser } from '~/hooks/useUser';
import { ListItem } from '~/components/ui/list-item';
import { Chips } from '~/components/ui/chips/chips';

type EditableField =
  | 'displayName'
  | 'height'
  | 'ethnicity'
  | 'hairColor'
  | 'eyeColor'
  | 'gender'
  | 'headshots'
  | 'sizing'
  | 'location'
  | 'workLocation'
  | 'representation'
  | 'union';

interface ProfileFieldConfig {
  label: string;
  value?: string;
  onPress?: () => void;
  preview?: React.ReactNode;
}

interface ProfileFieldListProps {
  fields: ProfileFieldConfig[];
  emptyMessage?: string;
}

function ProfileFieldList({ fields, emptyMessage }: ProfileFieldListProps) {
  if (fields.length === 0 && emptyMessage) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text variant="body" className="text-center text-text-low">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {fields.map((field, index) => (
        <ListItem
          key={index}
          variant="Experience"
          onPress={field.onPress}
          label={field.label}
          title={field.value || ''}
          preview={field.preview}
        />
      ))}
    </View>
  );
}

export default function AboutScreen() {
  const { user } = useUser();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Form refs for each field
  const displayNameFormRef = useRef<FormHandle>(null);
  const heightFormRef = useRef<FormHandle>(null);
  const ethnicityFormRef = useRef<FormHandle>(null);
  const hairColorFormRef = useRef<FormHandle>(null);
  const eyeColorFormRef = useRef<FormHandle>(null);
  const genderFormRef = useRef<FormHandle>(null);
  const workLocationFormRef = useRef<FormHandle>(null);
  const unionFormRef = useRef<FormHandle>(null);

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
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes);

  // Get the active profile based on user's active profile type
  const activeProfile = (
    user?.activeProfileType === 'dancer' ? dancerProfile : choreographerProfile
  ) as DancerDoc | ChoreographerDoc | null | undefined;

  const isDancer = user?.activeProfileType === 'dancer';
  const displayName = activeProfile?.displayName || user?.fullName || 'Not set';
  const profileType = user?.activeProfileType
    ? user.activeProfileType.charAt(0).toUpperCase() + user.activeProfileType.slice(1)
    : 'Not set';

  // Dancer-specific attributes
  const height =
    isDancer && activeProfile && 'attributes' in activeProfile
      ? activeProfile.attributes?.height
      : null;
  const ethnicity =
    isDancer && activeProfile && 'attributes' in activeProfile
      ? activeProfile.attributes?.ethnicity
      : null;
  const hairColor =
    isDancer && activeProfile && 'attributes' in activeProfile
      ? activeProfile.attributes?.hairColor
      : null;
  const eyeColor =
    isDancer && activeProfile && 'attributes' in activeProfile
      ? activeProfile.attributes?.eyeColor
      : null;
  const gender =
    isDancer && activeProfile && 'attributes' in activeProfile
      ? activeProfile.attributes?.gender
      : null;

  // Dancer-specific work details
  const workLocation =
    isDancer && activeProfile && 'workLocation' in activeProfile
      ? activeProfile.workLocation
      : null;
  const sagAftraId =
    isDancer && activeProfile && 'sagAftraId' in activeProfile ? activeProfile.sagAftraId : null;

  // Field configurations
  const profileFields = React.useMemo<ProfileFieldConfig[]>(
    () => [
      { label: 'PROFILE TYPE', value: profileType },
      { label: 'DISPLAY NAME', value: displayName, onPress: () => setEditingField('displayName') },
    ],
    [profileType, displayName]
  );

  const attributeFields = React.useMemo<ProfileFieldConfig[]>(
    () => [
      {
        label: 'HEIGHT',
        value: height ? `${height.feet}'${height.inches}"` : undefined,
        onPress: () => setEditingField('height'),
      },
      {
        label: 'ETHNICITY',
        value: ethnicity?.join(', '),
        onPress: () => setEditingField('ethnicity'),
      },
      { label: 'HAIR COLOR', value: hairColor ?? undefined, onPress: () => setEditingField('hairColor') },
      { label: 'EYE COLOR', value: eyeColor ?? undefined, onPress: () => setEditingField('eyeColor') },
      { label: 'GENDER', value: gender ?? undefined, onPress: () => setEditingField('gender') },
    ],
    [height, ethnicity, hairColor, eyeColor, gender]
  );

  const workDetailsFields = React.useMemo<ProfileFieldConfig[]>(
    () => [
      {
        label: 'WORK LOCATIONS',
        value: workLocation?.join(', ') || '',
        onPress: () => setEditingField('workLocation'),
        preview:
          workLocation && workLocation.length > 0 ? (
            <Chips variant="filter" items={workLocation} />
          ) : undefined,
      },
      {
        label: 'SAG-AFTRA',
        value: sagAftraId ? `Member ID: ${sagAftraId}` : 'Not a member',
        onPress: () => setEditingField('union'),
      },
    ],
    [workLocation, sagAftraId]
  );

  // Tabs - conditionally include Attributes for dancers only
  const tabs = React.useMemo(
    () => (isDancer ? ['Profile', 'Attributes', 'Work Details'] : ['Profile', 'Work Details']),
    [isDancer]
  );

  // Save handlers
  const handleSaveDisplayName = async (values: DisplayNameValues) => {
    try {
      if (isDancer) {
        await updateDancerProfile({ displayName: values.displayName.trim() });
      } else {
        await updateChoreographerProfile({ displayName: values.displayName.trim() });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save display name:', error);
    }
  };

  const handleSaveHeight = async (values: HeightValues) => {
    try {
      if (isDancer) {
        await patchDancerAttributes({ attributes: { height: values.height } });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save height:', error);
    }
  };

  const handleSaveEthnicity = async (values: any) => {
    try {
      if (isDancer) {
        await patchDancerAttributes({ attributes: { ethnicity: values.ethnicity } });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save ethnicity:', error);
    }
  };

  const handleSaveHairColor = async (values: any) => {
    try {
      if (isDancer) {
        await patchDancerAttributes({ attributes: { hairColor: values.hairColor } });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save hair color:', error);
    }
  };

  const handleSaveEyeColor = async (values: any) => {
    try {
      if (isDancer) {
        await patchDancerAttributes({ attributes: { eyeColor: values.eyeColor } });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save eye color:', error);
    }
  };

  const handleSaveGender = async (values: any) => {
    try {
      if (isDancer) {
        await patchDancerAttributes({ attributes: { gender: values.gender } });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save gender:', error);
    }
  };

  const handleSaveWorkLocation = async (values: WorkLocationValues) => {
    try {
      if (isDancer) {
        const workLocationStrings = values.locations
          .filter((loc): loc is PlaceKitLocation => loc !== null)
          .map((loc) => `${loc.city}, ${loc.state}`);
        await updateDancerProfile({ workLocation: workLocationStrings });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save work location:', error);
    }
  };

  const handleSaveUnion = async (values: UnionValues) => {
    try {
      if (isDancer) {
        await updateDancerProfile({ sagAftraId: values.sagAftraId || undefined });
      }
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save union:', error);
    }
  };

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'About',
      }}>
      <View className="flex-1">
        <TabbedView tabs={tabs} className="flex-1" contentClassName="flex-1 pt-6">
          {(activeTab) => (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {activeTab === 'Profile' && <ProfileFieldList fields={profileFields} />}
              {activeTab === 'Attributes' && <ProfileFieldList fields={attributeFields} />}
              {activeTab === 'Work Details' && <ProfileFieldList fields={workDetailsFields} />}
            </ScrollView>
          )}
        </TabbedView>
      </View>

      {/* Edit Sheets */}
      <FieldEditSheet
        title="Edit Display Name"
        description="Choose how your name appears on your profile"
        open={editingField === 'displayName'}
        onClose={() => setEditingField(null)}
        canSave={canSubmit}
        onSave={() => displayNameFormRef.current?.submit()}>
        <DisplayNameForm
          ref={displayNameFormRef}
          initialValues={{ displayName: activeProfile?.displayName || '' }}
          onSubmit={handleSaveDisplayName}
          onValidChange={setCanSubmit}
        />
      </FieldEditSheet>

      {isDancer && (
        <>
          <FieldEditSheet
            title="Edit Height"
            description="Update your height information"
            open={editingField === 'height'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => heightFormRef.current?.submit()}>
            <HeightForm
              ref={heightFormRef}
              initialValues={{
                height: height || { feet: 5, inches: 0 },
              }}
              onSubmit={handleSaveHeight}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Ethnicity"
            description="Select all that apply"
            open={editingField === 'ethnicity'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => ethnicityFormRef.current?.submit()}>
            <EthnicityForm
              ref={ethnicityFormRef}
              initialValues={{ ethnicity: ethnicity || [] }}
              onSubmit={handleSaveEthnicity}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Hair Color"
            description="Select your current hair color"
            open={editingField === 'hairColor'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => hairColorFormRef.current?.submit()}>
            <HairColorForm
              ref={hairColorFormRef}
              initialValues={{ hairColor: hairColor ?? undefined }}
              onSubmit={handleSaveHairColor}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Eye Color"
            description="Select your eye color"
            open={editingField === 'eyeColor'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => eyeColorFormRef.current?.submit()}>
            <EyeColorForm
              ref={eyeColorFormRef}
              initialValues={{ eyeColor: eyeColor ?? undefined }}
              onSubmit={handleSaveEyeColor}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Gender"
            description="Select the option that best describes you"
            open={editingField === 'gender'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => genderFormRef.current?.submit()}>
            <GenderForm
              ref={genderFormRef}
              initialValues={{ gender: gender ?? undefined }}
              onSubmit={handleSaveGender}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Work Locations"
            description="Select where you're willing to work"
            open={editingField === 'workLocation'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => workLocationFormRef.current?.submit()}>
            <WorkLocationForm
              ref={workLocationFormRef}
              initialValues={{
                locations:
                  workLocation?.map((locationStr) => {
                    const [city = '', state = ''] = locationStr.split(', ');
                    return {
                      city,
                      state,
                      stateCode: state,
                      country: 'United States',
                    };
                  }) || [],
              }}
              onSubmit={handleSaveWorkLocation}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>

          <FieldEditSheet
            title="Edit Union Membership"
            description="Are you a SAG-AFTRA member? Enter your ID if applicable."
            open={editingField === 'union'}
            onClose={() => setEditingField(null)}
            canSave={canSubmit}
            onSave={() => unionFormRef.current?.submit()}>
            <UnionForm
              ref={unionFormRef}
              initialValues={{ sagAftraId: sagAftraId || '' }}
              onSubmit={handleSaveUnion}
              onValidChange={setCanSubmit}
            />
          </FieldEditSheet>
        </>
      )}
    </TabScreenLayout>
  );
}
