import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';

import { ImagePreview } from './ImagePreview';
import { ImageUploadCard } from './ImageUploadCard';
import { ActivityIndicator } from '../ui/activity-indicator';
import { Text } from '../ui/text';

interface MultiImageUploadProps {
  onImageCountChange?: (count: number) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function MultiImageUpload({ onImageCountChange }: MultiImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveHeadshotIds = useMutation(api.users.headshots.saveHeadshotIds);
  const removeHeadshot = useMutation(api.users.headshots.removeHeadshot);
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);

  const canAddMore = (existingHeadshots?.length ?? 0) < 5;

  // Image picker functions
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  }, []);

  // Upload function
  const uploadImage = useCallback(
    async (imageUri: string) => {
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
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadState({ isUploading: false, progress: 0, error: errorMessage });
      }
    },
    [generateUploadUrl, saveHeadshotIds]
  );

  const handleImageUpload = useCallback(async () => {
    // Check UI limit of 3 images for this screen
    if ((existingHeadshots?.length ?? 0) >= 3) return;
    if (!canAddMore) return;

    // Show image source selector with proper upload flow
    Alert.alert('Select Image Source', 'Choose how you want to add your image', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await takePicture();
          if (result) {
            await uploadImage(result.uri);
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const result = await pickImage();
          if (result) {
            await uploadImage(result.uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [existingHeadshots?.length, canAddMore, takePicture, pickImage, uploadImage]);

  const handleRemoveImage = useCallback(
    async (storageId: string) => {
      try {
        await removeHeadshot({ headshotId: storageId as any });
        if (onImageCountChange) {
          onImageCountChange(Math.max(0, (existingHeadshots?.length ?? 0) - 1));
        }
      } catch (error) {
        console.error('Failed to remove image:', error);
      }
    },
    [removeHeadshot, existingHeadshots?.length, onImageCountChange]
  );

  // Create array of 3 slots for the grid
  const slots = Array.from({ length: 3 }, (_, index) => {
    const image = existingHeadshots?.[index];
    return { index, image };
  });

  // Determine which slot is the first empty one for active state
  const firstEmptySlotIndex = slots.findIndex((slot) => !slot.image);
  const uiCanAddMore = firstEmptySlotIndex !== -1 && canAddMore;

  return (
    <View className="flex-1">
      {/* Main upload area - first card full width */}
      <View className="mb-4">
        {slots[0].image?.url ? (
          <ImagePreview
            imageUrl={slots[0].image.url}
            onRemove={() => handleRemoveImage(slots[0].image!.storageId)}
          />
        ) : (
          <ImageUploadCard
            shape="primary"
            onPress={handleImageUpload}
            disabled={!uiCanAddMore}
            isActive={firstEmptySlotIndex === 0}
          />
        )}
      </View>

      {/* Grid of two cards in a row */}
      <View className="flex-row gap-4">
        {slots.slice(1).map((slot, gridIndex) => (
          <View key={`slot-${slot.index}`} className="flex-1">
            {slot.image?.url ? (
              <ImagePreview
                imageUrl={slot.image.url}
                onRemove={() => handleRemoveImage(slot.image!.storageId)}
              />
            ) : (
              <ImageUploadCard
                shape="secondary"
                onPress={handleImageUpload}
                disabled={!uiCanAddMore}
                isActive={firstEmptySlotIndex === slot.index}
              />
            )}
          </View>
        ))}
      </View>

      {/* Upload progress indicator */}
      {uploadState.isUploading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" />
          <Text variant="label" className="mt-2 text-text-high">
            Uploading image...
          </Text>
        </View>
      )}

      {/* Error message */}
      {uploadState.error && (
        <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Text variant="body" className="text-center text-text-error">
            {uploadState.error}
          </Text>
        </View>
      )}

      {/* Upload limit message */}
      {!uiCanAddMore && (existingHeadshots?.length ?? 0) >= 3 && (
        <View className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Text variant="body" className="text-center text-text-low">
            You've reached the maximum of 3 photos for this step
          </Text>
        </View>
      )}
    </View>
  );
}
