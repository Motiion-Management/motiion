import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useAction } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from '~/components/ui/activity-indicator';

interface ParsedResumeData {
  experiences: any[];
  training: any[];
  skills: string[];
  genres: string[];
  sagAftraId?: string;
}

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
    switch (type) {
      case 'tv-film':
        return 'Television & Film';
      case 'music-video':
        return 'Music Videos';
      case 'live-performance':
        return 'Live Performances';
      case 'commercial':
        return 'Commercials';
      default:
        return type;
    }
  };

  const formatTrainingType = (type: string) => {
    switch (type) {
      case 'education':
        return 'Education';
      case 'dance-school':
        return 'Dance School';
      case 'programs-intensives':
        return 'Programs & Intensives';
      case 'scholarships':
        return 'Scholarships';
      case 'other':
        return 'Other';
      default:
        return type;
    }
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
              <Text variant="body" className="text-text-secondary">
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
              <Text variant="header3" className="text-text-primary font-semibold">
                SAG - AFTRA ID
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="text-text-primary">
                  {editedData.sagAftraId}
                </Text>
              </View>
            </View>
          )}

          {/* Skills */}
          {editedData.skills.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="text-text-primary font-semibold">
                Skills({editedData.skills.length})
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="text-text-primary">
                  {editedData.skills.join(', ')}
                </Text>
              </View>
            </View>
          )}

          {/* Genres */}
          {editedData.genres.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="text-text-primary font-semibold">
                Genres({editedData.genres.length})
              </Text>
              <View className="bg-background-secondary rounded-lg p-3">
                <Text variant="body" className="text-text-primary">
                  {editedData.genres.join(', ')}
                </Text>
              </View>
            </View>
          )}

          {/* Experiences */}
          {editedData.experiences.length > 0 && (
            <View className="gap-2">
              <Text variant="header3" className="text-text-primary font-semibold">
                Experience({editedData.experiences.length})
              </Text>
              <View className="gap-3">
                {editedData.experiences.map((exp, index) => (
                  <View key={index} className="bg-background-secondary gap-2 rounded-lg p-3">
                    <View className="flex-row items-start justify-between">
                      <Text variant="body" className="text-text-primary flex-1 font-medium">
                        {exp.title || 'Untitled Project'}
                      </Text>
                      <View className="bg-accent-primary/10 rounded px-2 py-1">
                        <Text variant="caption1" className="text-accent-primary">
                          {formatExperienceType(exp.type)}
                        </Text>
                      </View>
                    </View>

                    {(exp.startDate || exp.endDate) && (
                      <Text variant="footnote" className="text-text-secondary">
                        {exp.startDate} {exp.endDate && exp.startDate ? ' - ' : ''} {exp.endDate}
                      </Text>
                    )}

                    {exp.roles && exp.roles.length > 0 && (
                      <Text variant="footnote" className="text-text-secondary">
                        Roles: {exp.roles.join(', ')}
                      </Text>
                    )}

                    {(exp.studio || exp.artists || exp.companyName || exp.venue) && (
                      <Text variant="footnote" className="text-text-secondary">
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
              <Text variant="header3" className="text-text-primary font-semibold">
                Training({editedData.training.length})
              </Text>
              <View className="gap-3">
                {editedData.training.map((train, index) => (
                  <View key={index} className="bg-background-secondary gap-2 rounded-lg p-3">
                    <View className="flex-row items-start justify-between">
                      <Text variant="body" className="text-text-primary flex-1 font-medium">
                        {train.institution}
                      </Text>
                      <View className="bg-accent-primary/10 rounded px-2 py-1">
                        <Text variant="caption1" className="text-accent-primary">
                          {formatTrainingType(train.type)}
                        </Text>
                      </View>
                    </View>

                    {(train.startYear || train.endYear) && (
                      <Text variant="footnote" className="text-text-secondary">
                        {train.startYear} {train.endYear && train.startYear ? ' - ' : ''}{' '}
                        {train.endYear}
                      </Text>
                    )}

                    {train.degree && (
                      <Text variant="footnote" className="text-text-secondary">
                        {train.degree}
                      </Text>
                    )}

                    {train.instructors && train.instructors.length > 0 && (
                      <Text variant="footnote" className="text-text-secondary">
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
                <Text variant="body" className="text-text-secondary text-center">
                  We couldn't extract much information from your resume.
                </Text>
                <Text variant="footnote" className="text-text-secondary text-center">
                  You can try uploading a different image or enter your information manually.
                </Text>
              </View>
            )}

          <View className="bg-accent-primary/5 gap-2 rounded-lg p-4">
            <Text variant="footnote" className="text-text-secondary text-center">
              💡 Tip: This information will be added to your existing profile.You can always edit or
              add more details later in your profile settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </BaseOnboardingScreen>
  );
}
