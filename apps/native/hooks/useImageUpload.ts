import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UploadedImage {
  uri: string;
  storageId: string;
  title?: string;
  uploadDate: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveHeadshotIds = useMutation(api.users.headshots.saveHeadshotIds);
  const removeHeadshot = useMutation(api.users.headshots.removeHeadshot);
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to upload images.');
      return false;
    }
    return true;
  }, []);

  const pickImage = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  }, [requestPermissions]);

  const takePicture = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to take pictures.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  }, []);

  const uploadImage = useCallback(
    async (imageUri: string): Promise<UploadedImage | null> => {
      try {
        setUploadState({ isUploading: true, progress: 0, error: null });

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload to Convex storage
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const { storageId } = await uploadResponse.json();

        // Save to user's headshots
        await saveHeadshotIds({
          headshots: [
            {
              storageId,
              uploadDate: new Date().toISOString(),
            },
          ],
        });

        setUploadState({ isUploading: false, progress: 100, error: null });

        return {
          uri: imageUri,
          storageId,
          uploadDate: new Date().toISOString(),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadState({ isUploading: false, progress: 0, error: errorMessage });
        return null;
      }
    },
    [generateUploadUrl, saveHeadshotIds]
  );

  const removeImage = useCallback(
    async (storageId: string): Promise<boolean> => {
      try {
        await removeHeadshot({ headshotId: storageId });
        return true;
      } catch (error) {
        console.error('Failed to remove image:', error);
        return false;
      }
    },
    [removeHeadshot]
  );

  const showImageSourceSelector = useCallback(() => {
    Alert.alert('Select Image Source', 'Choose how you want to add your image', [
      { text: 'Camera', onPress: takePicture },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [takePicture, pickImage]);

  return {
    // State
    uploadState,
    existingHeadshots: existingHeadshots ?? [],
    canAddMore: (existingHeadshots?.length ?? 0) < 5,
    hasImages: (existingHeadshots?.length ?? 0) > 0,

    // Actions
    pickImage,
    takePicture,
    uploadImage,
    removeImage,
    showImageSourceSelector,
  };
}
