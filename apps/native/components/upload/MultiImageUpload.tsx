import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState, useEffect } from 'react';
import { Alert, View } from 'react-native';
import Sortable from 'react-native-sortables';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { ImagePreview } from './ImagePreview';
import { UploadPlaceholder } from '../ui/upload-placeholder';
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
  position?: number;
}

export function MultiImageUpload({ onImageCountChange }: MultiImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [headshotsWithUrls, setHeadshotsWithUrls] = useState<HeadshotWithUrl[]>([]);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateMyDancerProfile = useMutation(api.dancers.updateMyDancerProfile);
  const deleteFile = useMutation(api.files.deleteFile);

  // Get headshots from profile
  const profile = useQuery(api.dancers.getMyDancerProfile, {});
  const headshotsMetadata = profile?.headshots ?? [];

  // Get URLs for all headshots
  const getHeadshotUrls = useQuery(
    api.files.getUrls,
    headshotsMetadata.length > 0
      ? { storageIds: headshotsMetadata.map((h: any) => h.storageId) }
      : 'skip'
  );

  // Update local state when metadata or URLs change
  useEffect(() => {
    if (headshotsMetadata) {
      const sortedMeta = [...headshotsMetadata].sort((a: any, b: any) => {
        const ap = a.position ?? 0;
        const bp = b.position ?? 0;
        return ap - bp;
      });
      const updatedHeadshots = sortedMeta.map((metadata) => {
        const urlData = getHeadshotUrls?.find((u: any) => u.storageId === metadata.storageId);
        return {
          ...metadata,
          url: urlData?.url,
          isLoading: !urlData,
        } as HeadshotWithUrl;
      });
      setHeadshotsWithUrls(updatedHeadshots);
    }
  }, [headshotsMetadata, getHeadshotUrls]);

  const canAddMore = headshotsWithUrls.length < 4;

  const imagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 4 - headshotsWithUrls.length,
    quality: 1, // Keep original quality; we compress in optimizer
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
      quality: 1, // Keep original quality; we compress in optimizer
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

          // Resize the image using Expo ImageManipulator
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );

          // Generate upload URL for each image
          const uploadUrl = await generateUploadUrl();

          // Upload optimized image to Convex storage
          const response = await fetch(manipResult.uri);
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

        // Save all headshots at once by appending to existing headshots
        const currentHeadshots = profile?.headshots ?? [];
        await updateMyDancerProfile({
          headshots: [...currentHeadshots, ...headshots],
        });

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
    [
      generateUploadUrl,
      updateMyDancerProfile,
      profile,
      headshotsWithUrls.length,
      onImageCountChange,
    ]
  );

  const handleImageUpload = useCallback(async () => {
    // Check UI limit of 4 images for this screen
    if (headshotsWithUrls.length >= 4) return;
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
      Alert.alert('Remove Image', 'Are you sure you want to remove this headshot?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentHeadshots = profile?.headshots ?? [];
              const updatedHeadshots = currentHeadshots.filter(
                (h: any) => h.storageId !== storageId
              );
              await updateMyDancerProfile({ headshots: updatedHeadshots });

              // Delete the actual file from storage
              try {
                await deleteFile({ storageId });
              } catch (error) {
                console.error('Failed to delete file from storage:', error);
                // Continue anyway since the reference is already removed
              }

              if (onImageCountChange) {
                onImageCountChange(Math.max(0, headshotsWithUrls.length - 1));
              }
            } catch (error) {
              console.error('Failed to remove image:', error);
            }
          },
        },
      ]);
    },
    [updateMyDancerProfile, deleteFile, profile, headshotsWithUrls.length, onImageCountChange]
  );

  // Derive first 4 headshots for this UI and remaining slots
  const sortableHeadshots = headshotsWithUrls.slice(0, 4);
  const remainingSlots = Math.max(0, 4 - sortableHeadshots.length);
  const uiCanAddMore = remainingSlots > 0 && canAddMore;

  const handleDragEnd = useCallback(
    ({ order }: { order: <T>(data: T[]) => T[] }) => {
      // Build combined list (headshots + upload placeholders) in current visual order
      const headshots = sortableHeadshots;
      const uploads = Array.from({ length: remainingSlots }).map((_, i) => ({
        type: 'upload' as const,
        key: `upload-${i}`,
      }));
      const items = [
        ...headshots.map((h) => ({
          type: 'headshot' as const,
          key: `h-${h.storageId}`,
          payload: h,
        })),
        ...uploads,
      ];

      // Let Sortable compute new child order, then filter back to headshots only
      const reordered = order(items);
      const nextHeadshots = reordered
        .filter(
          (i: any): i is { type: 'headshot'; key: string; payload: HeadshotWithUrl } =>
            i.type === 'headshot'
        )
        .map((i) => i.payload);

      const prev = headshots;
      // Optimistic local update (first 4 only)
      setHeadshotsWithUrls((current) => {
        const tail = current.slice(4);
        const updatedFirst = nextHeadshots.map((item, idx) => ({ ...item, position: idx }));
        return [...updatedFirst, ...tail];
      });

      // Persist; rollback on failure
      const currentHeadshots = profile?.headshots ?? [];
      const tail = currentHeadshots.slice(4);
      const reorderedHeadshots = [
        ...nextHeadshots.map((h, idx) => ({
          storageId: h.storageId,
          uploadDate: h.uploadDate || new Date().toISOString(),
          title: h.title,
          position: idx,
        })),
        ...tail,
      ];
      updateMyDancerProfile({ headshots: reorderedHeadshots as any }).catch(() => {
        setHeadshotsWithUrls((current) => {
          const tail = current.slice(4);
          const updatedFirst = prev.map((item, idx) => ({ ...item, position: idx }));
          return [...updatedFirst, ...tail];
        });
        Alert.alert('Reorder failed', 'Your order change could not be saved.');
      });
    },
    [sortableHeadshots, remainingSlots, updateMyDancerProfile, profile]
  );

  // Show skeleton while initial metadata is loading
  if (headshotsMetadata === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-4 py-4">
      {/* Sortable uploaded images */}
      <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} className="w-full">
        {containerWidth != null && (
          <Sortable.Flex
            customHandle
            gap={16}
            flexDirection="row"
            flexWrap="wrap"
            width={containerWidth}
            sortEnabled={!uploadState.isUploading}
            onDragEnd={handleDragEnd}
            overflow="visible"
            bringToFrontWhenActive
            dimensionsAnimationType="layout"
            itemsLayoutTransitionMode="reorder"
            activeItemScale={1.02}
            inactiveItemOpacity={0.8}
            dragActivationDelay={150}>
            {(() => {
              const headshots = sortableHeadshots;
              const uploads = Array.from({ length: remainingSlots }).map((_, i) => ({
                type: 'upload' as const,
                key: `upload-${i}`,
              }));
              const allItems = [
                ...headshots.map((h) => ({
                  type: 'headshot' as const,
                  key: `h-${h.storageId}`,
                  payload: h,
                })),
                ...uploads,
              ];

              let uploadIdx = 0;
              return allItems.map((item, index) => {
                const itemWidth = (containerWidth - 16) / 2;
                return (
                  <View
                    key={item.key}
                    style={{ width: itemWidth, height: 234, position: 'relative' }}>
                    {item.type === 'headshot' ? (
                      item.payload.url ? (
                        <Sortable.Handle mode="draggable">
                          <ImagePreview
                            imageUrl={item.payload.url}
                            onRemove={() => handleRemoveImage(item.payload.storageId)}
                          />
                        </Sortable.Handle>
                      ) : (
                        <View className="bg-bg-surface h-[234px] w-full items-center justify-center rounded">
                          <ActivityIndicator size="small" />
                        </View>
                      )
                    ) : (
                      (() => {
                        const isFirstUpload = uploadIdx === 0;
                        uploadIdx += 1;
                        return (
                          <Sortable.Handle mode="fixed-order">
                            <UploadPlaceholder
                              onPress={handleImageUpload}
                              isActive={isFirstUpload}
                              disabled={uploadState.isUploading || !uiCanAddMore}
                              height={234}
                            />
                          </Sortable.Handle>
                        );
                      })()
                    )}
                  </View>
                );
              });
            })()}
          </Sortable.Flex>
        )}
      </View>

      {/* Upload cards are rendered inside Sortable flex */}

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
