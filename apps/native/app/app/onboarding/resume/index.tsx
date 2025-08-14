import React, { useState, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useAction } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from '~/components/ui/activity-indicator';
import { router } from 'expo-router';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { ParsedResumeReview } from '~/components/resume/ParsedResumeReview';

interface ParsedResumeData {
  experiences: any[];
  training: any[];
  skills: string[];
  genres: string[];
  sagAftraId?: string;
}

export default function ResumeScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [hasError, setHasError] = useState(false);

  const nav = useSimpleOnboardingFlow();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const parseResumeImage = useAction(api.users.resumeImport.parseResumeImageDirect);

  const handleUploadResume = useCallback(async () => {
    try {
      setIsProcessing(true);
      setHasError(false);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to upload your resume.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.9,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
        body: await (await fetch(asset.uri)).blob(),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();

      // Parse the resume
      const parsed = await parseResumeImage({ imageStorageId: storageId });
      setParsedData(parsed);
    } catch (error) {
      console.error('Resume upload error:', error);
      setHasError(true);
      Alert.alert(
        'Upload Failed',
        "Sorry, we couldn't process your resume. Please try again or enter your information manually.",
        [
          { text: 'Try Again', onPress: () => setHasError(false) },
          { text: 'Enter Manually', onPress: handleSkip },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [generateUploadUrl, parseResumeImage]);

  const handleSkip = useCallback(() => {
    router.push('/app/onboarding/experiences');
  }, []);

  const handleTakePhoto = useCallback(async () => {
    try {
      setIsProcessing(true);
      setHasError(false);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera permissions to take a photo of your resume.'
        );
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
        body: await (await fetch(asset.uri)).blob(),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();

      // Parse the resume
      const parsed = await parseResumeImage({ imageStorageId: storageId });
      setParsedData(parsed);
    } catch (error) {
      console.error('Resume photo error:', error);
      setHasError(true);
      Alert.alert(
        'Photo Failed',
        "Sorry, we couldn't process your resume photo. Please try again or enter your information manually.",
        [
          { text: 'Try Again', onPress: () => setHasError(false) },
          { text: 'Enter Manually', onPress: handleSkip },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [generateUploadUrl, parseResumeImage, handleSkip]);

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
            {isProcessing ? (
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
                  onPress={handleUploadResume}
                  disabled={isProcessing}>
                  <Text>Upload from Photos</Text>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onPress={handleTakePhoto}
                  disabled={isProcessing}>
                  <Text>Take Photo</Text>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onPress={() => nav.navigatePrevious()}
                  disabled={isProcessing}>
                  <Text>Go Back</Text>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onPress={handleSkip}
                  disabled={isProcessing}>
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
