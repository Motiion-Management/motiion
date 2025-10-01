import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useAction } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type ParsedResumeData } from '@packages/backend/convex/ai/schemas';

// Supported file types for resume upload
const SUPPORTED_FILE_TYPES = [
  { mimeType: 'image/*', extension: '.jpg,.jpeg,.png,.gif' },
  { mimeType: 'application/pdf', extension: '.pdf' },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  },
  { mimeType: 'application/msword', extension: '.doc' },
];

interface UseResumeUploadOptions {
  onSuccess: (data: ParsedResumeData) => void;
  onSkip: () => void;
}

interface UseResumeUploadResult {
  models: {
    isProcessing: boolean;
    hasError: boolean;
    errorMessage?: string;
  };
  actions: {
    handleTakePhoto: () => Promise<void>;
    handleUploadImage: () => Promise<void>;
    handlePickDocument: () => Promise<void>;
    clearError: () => void;
  };
}

export function useResumeUpload({
  onSuccess,
  onSkip,
}: UseResumeUploadOptions): UseResumeUploadResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const parseResumeDocument = useAction((api.users.resumeImport as any).parseResumeDocument);

  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage(undefined);
  }, []);

  const showErrorAlert = useCallback(
    (title: string, message: string) => {
      setHasError(true);
      setErrorMessage(message);
      Alert.alert(title, message, [
        { text: 'Try Again', onPress: clearError },
        { text: 'Enter Manually', onPress: onSkip },
      ]);
    },
    [clearError, onSkip]
  );

  const getSupportedFileType = useCallback((mimeType: string, fileName: string) => {
    return SUPPORTED_FILE_TYPES.find(
      (type) =>
        mimeType?.includes(type.mimeType.replace('/*', '')) ||
        type.extension.split(',').some((ext) => fileName?.toLowerCase().endsWith(ext.trim()))
    );
  }, []);

  const uploadAndProcessFile = useCallback(
    async (uri: string, mimeType: string, fileName?: string) => {
      try {
        // Validate file type
        const supportedType = getSupportedFileType(mimeType, fileName || '');
        if (!supportedType) {
          throw new Error('Unsupported file type. Please upload an image, PDF, or Word document.');
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': mimeType || 'application/octet-stream' },
          body: await (await fetch(uri)).blob(),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { storageId } = await response.json();

        // Parse the resume
        const parsed = await parseResumeDocument({ storageId });
        onSuccess(parsed);
      } catch (error) {
        console.error('File processing error:', error);
        throw error;
      }
    },
    [getSupportedFileType, generateUploadUrl, parseResumeDocument, onSuccess]
  );

  const handleTakePhoto = useCallback(async () => {
    try {
      setIsProcessing(true);
      clearError();

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
      await uploadAndProcessFile(asset.uri, asset.mimeType || 'image/jpeg');
    } catch (error) {
      console.error('Photo capture error:', error);
      showErrorAlert(
        'Photo Failed',
        "Sorry, we couldn't process your resume photo. Please try again or enter your information manually."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [uploadAndProcessFile, showErrorAlert, clearError]);

  const handleUploadImage = useCallback(async () => {
    try {
      setIsProcessing(true);
      clearError();

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
      await uploadAndProcessFile(asset.uri, asset.mimeType || 'image/jpeg');
    } catch (error) {
      console.error('Image upload error:', error);
      showErrorAlert(
        'Upload Failed',
        "Sorry, we couldn't process your resume. Please try again or enter your information manually."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [uploadAndProcessFile, showErrorAlert, clearError]);

  const handlePickDocument = useCallback(async () => {
    try {
      setIsProcessing(true);
      clearError();

      // Pick a document using supported file types
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: SUPPORTED_FILE_TYPES.map((type) => type.mimeType),
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      await uploadAndProcessFile(
        asset.uri,
        asset.mimeType || 'application/octet-stream',
        asset.name
      );
    } catch (error) {
      console.error('Document upload error:', error);
      showErrorAlert(
        'Upload Failed',
        "Sorry, we couldn't process your file. Please try again or enter your information manually."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [uploadAndProcessFile, showErrorAlert, clearError]);

  return {
    models: {
      isProcessing,
      hasError,
      errorMessage,
    },
    actions: {
      handleTakePhoto,
      handleUploadImage,
      handlePickDocument,
      clearError,
    },
  };
}
