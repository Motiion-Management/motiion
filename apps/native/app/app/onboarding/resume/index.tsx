import React, { useState, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useAction } from 'convex/react';
import { useActionSheet } from '@expo/react-native-action-sheet';

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
  const { showActionSheetWithOptions } = useActionSheet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [hasError, setHasError] = useState(false);

  const nav = useSimpleOnboardingFlow();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const parseResumeDocument = useAction(api.users.resumeImport.parseResumeDocument);

  const handleImportIntent = () => {
    const options = ['Take Photo', 'Choose Image', 'Upload Document', 'Cancel'];
    // const destructiveButtonIndex = 0;
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        // destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            // Take Photo
            handleTakePhoto();
            break;
          case 1:
            // Choose Image
            handleUploadResume();
            break;

          case 2:
            // Upload Document
            handlePickDocument();
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  const handleSkip = useCallback(() => {
    router.push('/app/onboarding/experiences');
  }, []);

  const handlePickDocument = useCallback(async () => {
    try {
      setIsProcessing(true);
      setHasError(false);

      // Pick a document (support images, PDFs, and Word docs)
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: [
          'image/*', 
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': asset.mimeType || 'application/octet-stream' },
        body: await (await fetch(asset.uri)).blob(),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();

      // Parse the resume using unified API
      const parsed = await parseResumeDocument({ storageId });
      setParsedData(parsed);
    } catch (error) {
      console.error('Resume document upload error:', error);
      setHasError(true);
      Alert.alert(
        'Upload Failed',
        "Sorry, we couldn't process your file. Please try again or enter your information manually.",
        [
          { text: 'Try Again', onPress: () => setHasError(false) },
          { text: 'Enter Manually', onPress: handleSkip },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [generateUploadUrl, parseResumeDocument, handleSkip]);

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

      // Parse the resume using unified API
      const parsed = await parseResumeDocument({ storageId });
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
  }, [generateUploadUrl, parseResumeDocument, handleSkip]);

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

      // Parse the resume using unified API
      const parsed = await parseResumeDocument({ storageId });
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
  }, [generateUploadUrl, parseResumeDocument, handleSkip]);

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
                  onPress={handleImportIntent}
                  disabled={isProcessing}>
                  <Text>Import</Text>
                </Button>

                <Button size="lg" variant="secondary" onPress={handleSkip} disabled={isProcessing}>
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
