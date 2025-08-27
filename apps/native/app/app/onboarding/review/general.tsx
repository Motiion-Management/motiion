import { router } from 'expo-router';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';

import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';
import { useUser } from '~/hooks/useUser';
import ChevronRight from '~/lib/icons/ChevronRight';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Chips } from '~/components/ui/chips/chips';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useProgressiveImage } from '~/hooks/useProgressiveImage';

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
  const agencyId = user?.representation?.agencyId as any | undefined;
  const agency = useQuery(api.agencies.getAgency, agencyId ? { id: agencyId } : 'skip') as
    | { name: string }
    | undefined;

  const tabs = [
    { key: 'personal', label: 'Personal' },
    { key: 'work', label: 'Work' },
  ];

  // Headshot previews derived from user.headshots with progressive URL loading
  const headshotStorageIds = useMemo(() => {
    const list: any[] = (user?.headshots as any[]) || [];
    return list.map((h) => (typeof h === 'string' ? h : h?.storageId)).filter(Boolean) as string[];
  }, [user?.headshots]);

  function HeadshotThumb({ storageId }: { storageId: any }) {
    const { url } = useProgressiveImage(storageId);
    if (!url) {
      return (
        <View style={{ width: 40, height: 40, borderRadius: 8 }} className="bg-surface-high" />
      );
    }
    return <Image source={{ uri: url }} style={{ width: 40, height: 40, borderRadius: 8 }} />;
  }

  const handleEditField = useCallback((fieldName: string) => {
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
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/app/onboarding/review/experiences');
  }, []);

  // Preload modal module to reduce first-open latency
  useEffect(() => {
    import('../../(modals)/onboarding/review/[step]').catch(() => { });
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
              {/* Headshots with inline previews */}
              <Pressable
                onPress={() => handleEditField('headshots')}
                className="flex-row items-center justify-between border-b border-border-tint py-4">
                <View className="flex-1 gap-1">
                  <Text variant="labelXs" className="text-text-low">
                    Headshots
                  </Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    {headshotStorageIds.length > 0 ? (
                      headshotStorageIds
                        .slice(0, 3)
                        .map((id) => <HeadshotThumb key={id} storageId={id} />)
                    ) : (
                      <Text variant="body" className="text-text-default">
                        None
                      </Text>
                    )}
                    {headshotStorageIds.length > 3 && (
                      <Text variant="bodySm" className="text-text-secondary">
                        +{headshotStorageIds.length - 3}
                      </Text>
                    )}
                  </View>
                </View>
                <ChevronRight className="color-icon-default" />
              </Pressable>
              <ProfileField
                label="Sizing"
                value={user?.sizing ? `Edit sizing info` : `Edit sizing info`}
                onEdit={() => handleEditField('sizing')}
              />
              <ProfileField
                label="Primary Location"
                value={user?.location ? `${user.location.city}, ${user.location.state}` : undefined}
                onEdit={() => handleEditField('location')}
              />
              {/* Work Locations with city chips */}
              <Pressable
                onPress={() => handleEditField('work-location')}
                className="flex-row items-center justify-between border-b border-border-tint py-4">
                <View className="flex-1 gap-1">
                  <Text variant="labelXs" className="text-text-low">
                    Work Locations
                  </Text>
                  <View>
                    <Chips
                      variant="filter"
                      items={(user?.workLocation || [])
                        .map((s) => s.split(',')[0].trim())
                        .filter(Boolean)}
                    />
                  </View>
                </View>
                <ChevronRight className="color-icon-default" />
              </Pressable>
              <ProfileField
                label="Agency"
                value={agencyId ? agency?.name || 'Loading…' : 'Independent'}
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
