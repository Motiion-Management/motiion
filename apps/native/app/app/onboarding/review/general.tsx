import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';

import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';
import { useUser } from '~/hooks/useUser';
import ChevronRight from '~/lib/icons/ChevronRight';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

interface ProfileFieldProps {
  label: string;
  value?: string | string[] | null;
  onEdit?: () => void;
  isArray?: boolean;
}

function ProfileField({ label, value, onEdit, isArray = false }: ProfileFieldProps) {
  const displayValue = (() => {
    if (!value) return 'Not provided';
    if (isArray && Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not provided';
    }
    return String(value);
  })();

  return (
    <Pressable
      onPress={onEdit}
      className="flex-row items-center justify-between border-b border-border-tint py-4">
      <View className="flex-1 gap-1">
        <Text variant="labelXs" className="text-text-low">
          {label}
        </Text>
        <Text variant="body" className="text-text-default">
          {displayValue}
        </Text>
      </View>
      {onEdit && <ChevronRight className="color-icon-default" />}
    </Pressable>
  );
}

export default function GeneralReviewScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'personal' | 'work'>('personal');

  const tabs = [
    { key: 'personal', label: 'Personal' },
    { key: 'work', label: 'Work' },
  ];

  const handleEditField = useCallback(
    (fieldName: string) => {
      // Map field names to form types
      const fieldToFormMap = {
        'display-name': 'display-name',
        height: 'height',
        ethnicity: 'ethnicity',
        'hair-color': 'hair-color',
        'eye-color': 'eye-color',
        gender: 'gender',
        headshots: 'headshots',
        sizing: 'sizing',
        location: 'location',
        'work-location': 'work-location',
        representation: 'representation',
        agency: 'agency',
      } as const;

      const formType = fieldToFormMap[fieldName as keyof typeof fieldToFormMap];
      if (formType) router.push(`/app/onboarding/review/${formType}`);
    },
    []
  );

  const handleContinue = useCallback(() => {
    router.push('/app/onboarding/review/experiences');
  }, []);

  // Preload modal module to reduce first-open latency
  useEffect(() => {
    import('../../(modals)/onboarding/review/[step]').catch(() => {})
  }, []);

  return (
    <BaseOnboardingScreen
      title="Review your profile"
      description="Check your information and make edits if needed"
      canProgress={true}
      primaryAction={{
        onPress: handleContinue,
      }}
      scrollEnabled={false}>
      <View className="flex-1">
        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(k) => setActiveTab(k as 'personal' | 'work')}
          className="mb-4"
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <View>
              <ProfileField
                label="Display Name"
                value={user?.displayName}
                onEdit={() => handleEditField('display-name')}
              />
              <ProfileField
                label="Height"
                value={
                  user?.attributes?.height
                    ? `${user.attributes.height.feet}'${user.attributes.height.inches}"`
                    : undefined
                }
                onEdit={() => handleEditField('height')}
              />
              <ProfileField
                label="Ethnicity"
                value={user?.attributes?.ethnicity}
                isArray={true}
                onEdit={() => handleEditField('ethnicity')}
              />
              <ProfileField
                label="Hair Color"
                value={user?.attributes?.hairColor}
                onEdit={() => handleEditField('hair-color')}
              />
              <ProfileField
                label="Eye Color"
                value={user?.attributes?.eyeColor}
                onEdit={() => handleEditField('eye-color')}
              />
              <ProfileField
                label="Gender"
                value={user?.attributes?.gender}
                onEdit={() => handleEditField('gender')}
              />
            </View>
          )}

          {/* Work Information Tab */}
          {activeTab === 'work' && (
            <View>
              <ProfileField
                label="Headshots"
                value={user?.headshots?.length ? `${user.headshots.length} photos` : undefined}
                onEdit={() => handleEditField('headshots')}
              />
              <ProfileField
                label="Sizing"
                value={user?.sizing ? `General sizing information provided` : undefined}
                onEdit={() => handleEditField('sizing')}
              />
              <ProfileField
                label="Primary Location"
                value={user?.location ? `${user.location.city}, ${user.location.state}` : undefined}
                onEdit={() => handleEditField('location')}
              />
              <ProfileField
                label="Work Locations"
                value={user?.workLocation}
                isArray={true}
                onEdit={() => handleEditField('work-location')}
              />
              <ProfileField
                label="Agency"
                value={user?.representation?.agencyId ? 'Set' : 'Independent'}
                onEdit={() => handleEditField('representation')}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal edits navigate to /app/onboarding/review/[step] */}
    </BaseOnboardingScreen>
  );
}
