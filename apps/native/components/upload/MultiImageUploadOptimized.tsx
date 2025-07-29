import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState, useEffect, memo } from 'react';
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

interface HeadshotWithUrl {
  storageId: string;
  uploadDate?: string;
  title?: string;
  url?: string | null;
  isLoading?: boolean;
}

// Memoized image slot component to prevent unnecessary re-renders
const ImageSlot = memo(
  ({
    image,
    index,
    onRemove,
    onUpload,
    canAdd,
    isFirstEmpty,
    shape,
  }: {
    image?: HeadshotWithUrl;
    index: number;
    onRemove: (storageId: string) => void;
    onUpload: () => void;
    canAdd: boolean;
    isFirstEmpty: boolean;
    shape: 'primary' | 'secondary';
  }) => {
    if (image?.url) {
      return <ImagePreview imageUrl={image.url} onRemove={() => onRemove(image.storageId)} />;
    }

    if (image && image.isLoading) {
      return (
        <View className="bg-bg-surface h-[234px] w-full items-center justify-center rounded">
          <ActivityIndicator size="small" />
        </View>
      );
    }

    return (
      <ImageUploadCard
        shape={shape}
        onPress={onUpload}
        disabled={!canAdd}
        isActive={isFirstEmpty}
      />
    );
  }
);

ImageSlot.displayName = 'ImageSlot';

export function MultiImageUploadOptimized({ onImageCountChange }: MultiImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [headshotsWithUrls, setHeadshotsWithUrls] = useState<HeadshotWithUrl[]>([]);

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveHeadshotIds = useMutation(api.users.headshots.saveHeadshotIds);
  const removeHeadshot = useMutation(api.users.headshots.removeHeadshot);

  // Use optimized query that doesn't block on URL generation
  const headshotsMetadata = useQuery(api.users.headshotsOptimized.getMyHeadshotsMetadata);
  const getHeadshotUrls = useQuery(
    api.users.headshotsOptimized.getHeadshotUrls,
    headshotsMetadata ? { storageIds: headshotsMetadata.map((h) => h.storageId) } : 'skip'
  );

  // Update local state when metadata or URLs change
  useEffect(() => {
    if (headshotsMetadata) {
      const updatedHeadshots = headshotsMetadata.map((metadata) => {
        const urlData = getHeadshotUrls?.find((u) => u.storageId === metadata.storageId);
        return {
          ...metadata,
          url: urlData?.url,
          isLoading: !urlData,
        };
      });
      setHeadshotsWithUrls(updatedHeadshots);
    }
  }, [headshotsMetadata, getHeadshotUrls]);

  const canAddMore = headshotsWithUrls.length < 5;

  const imagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 3 - headshotsWithUrls.length,
  };

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

    const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets;
    }
    return null;
  }, [requestPermissions, imagePickerOptions.selectionLimit]);

  const takePicture = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to take pictures.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  }, []);

  // Upload function for multiple images
  const uploadImages = useCallback(
    async (imageAssets: ImagePicker.ImagePickerAsset[]) => {
      try {
        setUploadState({ isUploading: true, progress: 0, error: null });

        const headshots = [];
        const totalImages = imageAssets.length;

        for (let i = 0; i < totalImages; i++) {
          const asset = imageAssets[i];

          // Generate upload URL for each image
          const uploadUrl = await generateUploadUrl();

          // Upload to Convex storage
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': blob.type },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed for image ${i + 1}`);
          }

          const { storageId } = await uploadResponse.json();
          headshots.push({
            storageId,
            uploadDate: new Date().toISOString(),
          });

          // Update progress
          const progress = Math.round(((i + 1) / totalImages) * 100);
          setUploadState({ isUploading: true, progress, error: null });
        }

        // Save all headshots at once
        await saveHeadshotIds({ headshots });

        setUploadState({ isUploading: false, progress: 100, error: null });

        // Notify parent of count change
        if (onImageCountChange) {
          onImageCountChange(headshotsWithUrls.length + headshots.length);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadState({ isUploading: false, progress: 0, error: errorMessage });
      }
    },
    [generateUploadUrl, saveHeadshotIds, headshotsWithUrls.length, onImageCountChange]
  );

  const handleImageUpload = useCallback(async () => {
    // Check UI limit of 3 images for this screen
    if (headshotsWithUrls.length >= 3) return;
    if (!canAddMore) return;

    // Show image source selector with proper upload flow
    Alert.alert('Select Image Source', 'Choose how you want to add your image', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await takePicture();
          if (result) {
            await uploadImages([result]);
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const result = await pickImage();
          if (result) {
            await uploadImages(result);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [headshotsWithUrls.length, canAddMore, takePicture, pickImage, uploadImages]);

  const handleRemoveImage = useCallback(
    async (storageId: string) => {
      try {
        await removeHeadshot({ headshotId: storageId as any });
        if (onImageCountChange) {
          onImageCountChange(Math.max(0, headshotsWithUrls.length - 1));
        }
      } catch (error) {
        console.error('Failed to remove image:', error);
      }
    },
    [removeHeadshot, headshotsWithUrls.length, onImageCountChange]
  );

  // Create array of 3 slots for the grid
  const slots = Array.from({ length: 3 }, (_, index) => {
    const image = headshotsWithUrls[index];
    return { index, image };
  });

  // Determine which slot is the first empty one for active state
  const firstEmptySlotIndex = slots.findIndex((slot) => !slot.image);
  const uiCanAddMore = firstEmptySlotIndex !== -1 && canAddMore;

  // Show skeleton while initial metadata is loading
  if (headshotsMetadata === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-4">
      {/* Main upload area - first card full width */}
      <ImageSlot
        image={slots[0].image}
        index={0}
        onRemove={handleRemoveImage}
        onUpload={handleImageUpload}
        canAdd={uiCanAddMore}
        isFirstEmpty={firstEmptySlotIndex === 0}
        shape="primary"
      />

      {/* Grid of two cards in a row */}
      <View className="flex-row gap-4">
        {slots.slice(1).map((slot) => (
          <View key={`slot-${slot.index}`} className="flex-1">
            <ImageSlot
              image={slot.image}
              index={slot.index}
              onRemove={handleRemoveImage}
              onUpload={handleImageUpload}
              canAdd={uiCanAddMore}
              isFirstEmpty={firstEmptySlotIndex === slot.index}
              shape="secondary"
            />
          </View>
        ))}
      </View>

      {/* Upload progress indicator */}
      {uploadState.isUploading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" />
          <Text variant="label" className="mt-2 text-text-high">
            Uploading image... {uploadState.progress}%
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
    </View>
  );
}
