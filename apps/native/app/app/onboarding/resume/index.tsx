import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { router } from 'expo-router';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from '~/components/ui/activity-indicator';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { ParsedResumeReview } from '~/components/resume/ParsedResumeReview';
import { useResumeUpload } from '~/hooks/useResumeUpload';
import { type ParsedResumeData } from '@packages/backend/convex/ai/schemas';

export default function ResumeScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);

  const nav = useSimpleOnboardingFlow();

  const handleSkip = useCallback(() => {
    router.push('/app/onboarding/experiences');
  }, []);

  const resumeUpload = useResumeUpload({
    onSuccess: setParsedData,
    onSkip: handleSkip,
  });

  const handleImportIntent = () => {
    const options = ['Take Photo', 'Choose Image', 'Upload Document', 'Cancel'];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            resumeUpload.actions.handleTakePhoto();
            break;
          case 1:
            resumeUpload.actions.handleUploadImage();
            break;
          case 2:
            resumeUpload.actions.handlePickDocument();
            break;
          case cancelButtonIndex:
            // Canceled
            break;
        }
      }
    );
  };

  const handleReviewComplete = useCallback(() => {
    // After user reviews and confirms the data, proceed to next step
    router.push('/app/onboarding/experiences');
  }, []);

  // Show parsed data review screen
  if (parsedData) {
    return (
      <ParsedResumeReview
        parsedData={parsedData}
        onComplete={handleReviewComplete}
        onStartOver={() => setParsedData(null)}
      />
    );
  }

  return (
    <OnboardingStepGuard requiredStep="resume">
      <BaseOnboardingScreen
        title="Import your resume"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleSkip,
          disabled: true, // TODO: Enable when form is valid
        }}
        bottomActionSlot={
          <View className="w-full gap-3">
            {resumeUpload.models.isProcessing ? (
              <View className="flex-row items-center justify-center p-4">
                <ActivityIndicator size="small" className="mr-2" />
                <Text variant="body" className="text-text-secondary">
                  Processing your resume...
                </Text>
              </View>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onPress={handleImportIntent}
                  disabled={resumeUpload.models.isProcessing}>
                  <Text>Import</Text>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  onPress={handleSkip}
                  disabled={resumeUpload.models.isProcessing}>
                  <Text>Enter Manually</Text>
                </Button>
              </>
            )}
          </View>
        }>
        <Image
          style={{ width: 350, height: 350 }}
          source={require('../../../../assets/images/onboarding/resume.png')}
        />
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
