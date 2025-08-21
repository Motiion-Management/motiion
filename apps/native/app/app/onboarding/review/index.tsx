import React, { useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useUser } from '~/hooks/useUser';

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
    <View className="border-border-primary/10 flex-row items-center justify-between border-b py-3">
      <View className="flex-1">
        <Text variant="body" className="mb-1 font-medium">
          {label}
        </Text>
        <Text variant="footnote" className="text-text-secondary">
          {displayValue}
        </Text>
      </View>
      {onEdit && (
        <Button variant="outline" size="sm" onPress={onEdit}>
          <Text variant="caption1">Edit</Text>
        </Button>
      )}
    </View>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  hasErrors?: boolean;
}

function Section({ title, children, hasErrors = false }: SectionProps) {
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center">
        <Text variant="header3" className="flex-1 font-semibold">
          {title}
        </Text>
        {hasErrors && (
          <View className="bg-error/10 rounded px-2 py-1">
            <Text variant="caption1" className="text-error">
              ⚠ Incomplete
            </Text>
          </View>
        )}
      </View>
      <View className="bg-background-secondary rounded-lg p-4">{children}</View>
    </View>
  );
}

export default function ReviewScreen() {
  const { user } = useUser();
  const experiences = useQuery(api.users.experiences.getMyExperiences) || [];
  const training = useQuery(api.training.getMyTraining) || [];

  const handleEditField = useCallback((fieldName: string) => {
    // Navigate to the specific onboarding step for editing
    const fieldToStepMap = {
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
      experiences: 'experiences',
      training: 'training',
      skills: 'skills',
      union: 'union',
    };

    const step = fieldToStepMap[fieldName as keyof typeof fieldToStepMap];
    if (step) {
      router.push(`/app/onboarding/${step}` as any);
    }
  }, []);

  const handleComplete = useCallback(() => {
    router.push('/app/onboarding/complete');
  }, []);

  // Check for missing required fields
  const hasAttributeErrors = !user?.displayName || !user?.attributes?.height;
  const hasWorkDetailErrors = !user?.headshots?.length || !user?.location?.city;

  return (
    <OnboardingStepGuard requiredStep="review">
      <BaseOnboardingScreen
        title="Review your profile information"
        description="Tap on any field to edit."
        canProgress={true}
        primaryAction={{
          onPress: handleComplete,
        }}
        bottomActionSlot={
          <Button size="lg" className="w-full" onPress={handleComplete}>
            <Text>Complete Profile</Text>
          </Button>
        }>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="pb-8">
            {/* Attributes Section */}
            <Section title="Attributes" hasErrors={hasAttributeErrors}>
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
            </Section>

            {/* Work Details Section */}
            <Section title="Work Details" hasErrors={hasWorkDetailErrors}>
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
            </Section>

            {/* Experiences Section */}
            {experiences.length > 0 && (
              <Section title={`Experience (${experiences.length})`}>
                {experiences.slice(0, 3).map((exp: any, index: number) => (
                  <ProfileField
                    key={exp._id}
                    label={exp.title || 'Untitled Project'}
                    value={exp.type}
                    onEdit={() => handleEditField('experiences')}
                  />
                ))}
                {experiences.length > 3 && (
                  <ProfileField
                    label={`+${experiences.length - 3} more experiences`}
                    value=""
                    onEdit={() => handleEditField('experiences')}
                  />
                )}
              </Section>
            )}

            {/* Training Section */}
            {training.length > 0 && (
              <Section title={`Training (${training.length})`}>
                {training.slice(0, 3).map((train: any, index: number) => (
                  <ProfileField
                    key={train._id}
                    label={train.institution}
                    value={train.type}
                    onEdit={() => handleEditField('training')}
                  />
                ))}
                {training.length > 3 && (
                  <ProfileField
                    label={`+${training.length - 3} more training`}
                    value=""
                    onEdit={() => handleEditField('training')}
                  />
                )}
              </Section>
            )}

            {/* Skills & Union Section */}
            {(user?.resume?.skills?.length || user?.sagAftraId) && (
              <Section title="Additional Info">
                {user?.resume?.skills && (
                  <ProfileField
                    label="Skills"
                    value={user.resume.skills}
                    isArray={true}
                    onEdit={() => handleEditField('skills')}
                  />
                )}
                {user?.sagAftraId && (
                  <ProfileField
                    label="SAG-AFTRA ID"
                    value={user.sagAftraId}
                    onEdit={() => handleEditField('union')}
                  />
                )}
              </Section>
            )}

            {/* Empty state message */}
            {!user?.displayName && experiences.length === 0 && training.length === 0 && (
              <View className="bg-accent-primary/5 rounded-lg p-6 text-center">
                <Text variant="body" className="mb-2 text-center">
                  Your profile is looking a bit empty!
                </Text>
                <Text variant="footnote" className="text-text-secondary text-center">
                  Add some information to help others discover your talents.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
