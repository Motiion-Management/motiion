import { useCallback } from 'react';
import { Alert, View } from 'react-native';

import { ImagePreview } from './ImagePreview';
import { ImageUploadCard } from './ImageUploadCard';
import { ActivityIndicator } from '../ui/activity-indicator';
import { Text } from '../ui/text';

import { useImageUpload } from '~/hooks/useImageUpload';

interface MultiImageUploadProps {
  onImageCountChange?: (count: number) => void;
}

export function MultiImageUpload({ onImageCountChange }: MultiImageUploadProps) {
  const {
    uploadState,
    existingHeadshots,
    canAddMore,
    uploadImage,
    removeImage,
    pickImage,
    takePicture,
  } = useImageUpload();

  const handleImageUpload = useCallback(async () => {
    // Check UI limit of 3 images for this screen
    if (existingHeadshots.length >= 3) return;
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
  }, [existingHeadshots.length, canAddMore, takePicture, pickImage, uploadImage]);

  const handleRemoveImage = useCallback(
    async (storageId: string) => {
      const success = await removeImage(storageId);
      if (success && onImageCountChange) {
        onImageCountChange(Math.max(0, existingHeadshots.length - 1));
      }
    },
    [removeImage, existingHeadshots.length, onImageCountChange]
  );

  // Create array of 3 slots for the grid
  const slots = Array.from({ length: 3 }, (_, index) => {
    const image = existingHeadshots[index];
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
          <Text variant="caption" className="text-text-muted mt-2">
            Uploading image...
          </Text>
        </View>
      )}

      {/* Error message */}
      {uploadState.error && (
        <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Text variant="body" className="text-center text-red-600">
            {uploadState.error}
          </Text>
        </View>
      )}

      {/* Upload limit message */}
      {!uiCanAddMore && existingHeadshots.length >= 3 && (
        <View className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Text variant="body" className="text-center text-blue-600">
            You've reached the maximum of 3 photos for this step
          </Text>
        </View>
      )}
    </View>
  );
}
