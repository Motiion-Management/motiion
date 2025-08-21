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
import { ResumeImportStatus } from '~/components/resume/ResumeImportStatus';
import { useResumeUpload } from '~/hooks/useResumeUpload';
import { type ParsedResumeData } from '@packages/backend/convex/ai/schemas';

export default function ResumeScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [showImportStatus, setShowImportStatus] = useState(false);

  const nav = useSimpleOnboardingFlow();

  const handleSkip = useCallback(() => {
    nav.navigateNext();
  }, [nav]);

  const handleResumeUploadStart = useCallback(() => {
    setShowImportStatus(true);
  }, []);

  const handleImportComplete = useCallback(() => {
    setShowImportStatus(false);
    // This would normally be triggered by actual resume processing
    // For now, we'll simulate the completion
    setTimeout(() => {
      // In real implementation, this would come from the upload hook
      // setParsedData(actualParsedData);
    }, 100);
  }, []);

  const resumeUpload = useResumeUpload({
    onSuccess: (data) => {
      setShowImportStatus(false);
      setParsedData(data);
    },
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
    nav.navigateNext();
  }, [nav]);

  // Show import status screen
  if (showImportStatus) {
    return <ResumeImportStatus onComplete={handleImportComplete} />;
  }

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
