import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useAction } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from '~/components/ui/activity-indicator';
import { type ParsedResumeData } from '@packages/backend/convex/ai/schemas';
import { PROJECT_TITLE_MAP } from '@packages/backend/convex/validators/projects';

interface ParsedResumeReviewProps {
  parsedData: ParsedResumeData;
  onComplete: () => void;
  onStartOver: () => void;
}

export function ParsedResumeReview({
  parsedData,
  onComplete,
  onStartOver,
}: ParsedResumeReviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState(parsedData);

  const applyParsedData = useMutation(api.users.resumeImport.applyParsedResumeData);

  const handleSaveAndContinue = useCallback(async () => {
    try {
      setIsSaving(true);

      await applyParsedData({
        experiences: editedData.experiences,
        training: editedData.training,
        skills: editedData.skills,
        genres: editedData.genres,
        sagAftraId: editedData.sagAftraId,
      });

      onComplete();
    } catch (error) {
      console.error('Failed to save resume data:', error);
      Alert.alert('Save Failed', "Sorry, we couldn't save your resume data. Please try again.", [
        { text: 'OK' },
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [editedData, applyParsedData, onComplete]);

  const formatExperienceType = (type: string) => {
    return PROJECT_TITLE_MAP[type as keyof typeof PROJECT_TITLE_MAP] || type;
  };

  const formatTrainingType = (type: string) => {
    const typeMap = {
      education: 'Education',
      'dance-school': 'Dance School',
      'programs-intensives': 'Programs & Intensives',
      scholarships: 'Scholarships',
      other: 'Other',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  return (
    <BaseOnboardingScreen
      title="Review your resume"
      description="Please review the information we extracted from your resume. You can edit any details before saving."
      canProgress={true}
      primaryAction={{
        onPress: handleSaveAndContinue,
        disabled: isSaving,
      }}
      bottomActionSlot={
        <View className="w-full gap-3">
          {isSaving ? (
            <View className="flex-row items-center justify-center p-4">
              <ActivityIndicator size="small" className="mr-2" />
              <Text variant="body" className="">
                Saving your resume...
              </Text>
            </View>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                onPress={handleSaveAndContinue}
                disabled={isSaving}>
                <Text>Save & Continue</Text>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onPress={onStartOver}
                disabled={isSaving}>
                <Text>Upload Different Resume</Text>
              </Button>
            </>
          )}
        </View>
      }>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* SAG-AFTRA ID */}
          {editedData.sagAftraId && (
            <View className="gap-2">
              <Text variant="header3" className="font-semibold">
                SAG - AFTRA ID
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="">
                  {editedData.sagAftraId}
                </Text>
              </View>
            </View>
          )}

          {/* Skills */}
          {editedData.skills.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="font-semibold">
                Skills({editedData.skills.length})
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="">
                  {editedData.skills.join(', ')}
                </Text>
              </View>
            </View>
          )}

          {/* Genres */}
          {editedData.genres.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="font-semibold">
                Genres({editedData.genres.length})
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="">
                  {editedData.genres.join(', ')}
                </Text>
              </View>
            </View>
          )}

          {/* Projects */}
          {editedData.experiences.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="font-semibold">
                Projects ({editedData.experiences.length})
              </Text>
              <View className="gap-3">
                {editedData.experiences.map((exp, index) => (
                  <View key={index} className="bg-background-secondary gap-2 rounded-lg p-3">
                    <View className="flex-row items-start justify-between">
                      <Text variant="body" className="flex-1 font-medium">
                        {exp.title || 'Untitled Project'}
                      </Text>
                      <View className="bg-accent-primary/10 rounded px-2 py-1">
                        <Text variant="caption1" className="">
                          {formatExperienceType(exp.type)}
                        </Text>
                      </View>
                    </View>

                    {(exp.startDate || exp.endDate) && (
                      <Text variant="footnote" className="">
                        {exp.startDate} {exp.endDate && exp.startDate ? ' - ' : ''} {exp.endDate}
                      </Text>
                    )}

                    {exp.roles && exp.roles.length > 0 && (
                      <Text variant="footnote" className="">
                        Roles: {exp.roles.join(', ')}
                      </Text>
                    )}

                    {(exp.studio || exp.artists || exp.companyName || exp.venue) && (
                      <Text variant="footnote" className="">
                        {exp.studio ||
                          (exp.artists && exp.artists.join(', ')) ||
                          exp.companyName ||
                          exp.venue}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Training */}
          {editedData.training.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="font-semibold">
                Training({editedData.training.length})
              </Text>
              <View className="gap-3">
                {editedData.training.map((train, index) => (
                  <View key={index} className="bg-background-secondary gap-2 rounded-lg p-3">
                    <View className="flex-row items-start justify-between">
                      <Text variant="body" className="flex-1 font-medium">
                        {train.institution}
                      </Text>
                      <View className="bg-accent-primary/10 rounded px-2 py-1">
                        <Text variant="caption1" className="">
                          {formatTrainingType(train.type)}
                        </Text>
                      </View>
                    </View>

                    {(train.startYear || train.endYear) && (
                      <Text variant="footnote" className="">
                        {train.startYear} {train.endYear && train.startYear ? ' - ' : ''}{' '}
                        {train.endYear}
                      </Text>
                    )}

                    {train.degree && (
                      <Text variant="footnote" className="">
                        {train.degree}
                      </Text>
                    )}

                    {train.instructors && train.instructors.length > 0 && (
                      <Text variant="footnote" className="">
                        Instructors: {train.instructors.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty state */}
          {editedData.experiences.length === 0 &&
            editedData.training.length === 0 &&
            editedData.skills.length === 0 &&
            editedData.genres.length === 0 &&
            !editedData.sagAftraId && (
              <View className="bg-background-secondary items-center gap-2 rounded-lg p-6">
                <Text variant="body" className="text-center">
                  We couldn't extract much information from your resume.
                </Text>
                <Text variant="footnote" className="text-center">
                  You can try uploading a different image or enter your information manually.
                </Text>
              </View>
            )}

          <View className="bg-accent-primary/5 gap-2 rounded-lg p-4">
            <Text variant="footnote" className="text-center">
              💡 Tip: This information will be added to your existing profile.You can always edit or
              add more details later in your profile settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </BaseOnboardingScreen>
  );
}
