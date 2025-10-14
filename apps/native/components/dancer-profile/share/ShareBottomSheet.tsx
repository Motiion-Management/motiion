import React, { useCallback } from 'react';
import { View, Image, Share, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { File } from 'expo-file-system';
import { Sheet } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';

interface ShareBottomSheetProps {
  visible: boolean;
  imageUri: string;
  shareUrl: string;
  onClose: () => void;
}

export function ShareBottomSheet({ visible, imageUri, shareUrl, onClose }: ShareBottomSheetProps) {
  // Download image to Photos
  const handleSaveImage = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save photos');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Success', 'Image saved to Photos');
      onClose();
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  }, [imageUri, onClose]);

  // Copy image to clipboard
  const handleCopyImage = useCallback(async () => {
    try {
      const file = new File(imageUri);
      const base64 = await file.base64();
      await Clipboard.setImageAsync(base64);
      Alert.alert('Success', 'Image copied to clipboard');
      onClose();
    } catch (error) {
      console.error('Error copying image:', error);
      Alert.alert('Error', 'Failed to copy image');
    }
  }, [imageUri, onClose]);

  // Share image using system share sheet
  const handleShareImage = useCallback(async () => {
    try {
      await Share.share({
        url: imageUri,
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  }, [imageUri]);

  const handleSheetChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Sheet
      isOpened={visible}
      onIsOpenedChange={handleSheetChange}
      label="Share"
      enableDynamicSizing
      backgroundClassName="bg-surface-default">
      <View className="px-6 pb-6">
        {/* Image Preview */}
        <View className="mb-6 items-center">
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 380,
              height: 280,
              borderRadius: 20,
            }}
            resizeMode="cover"
          />
        </View>

        {/* Share Actions - Horizontal Icon Row */}
        <View className="flex-row items-center justify-center gap-4">
          {/* Download */}
          <Button variant="secondary" size="icon" onPress={handleSaveImage}>
            <Icon name="arrow.down.to.line" size={24} className="text-icon-default" />
          </Button>

          {/* Copy Image */}
          <Button variant="secondary" size="icon" onPress={handleCopyImage}>
            <Icon name="square.on.square" size={24} className="text-icon-default" />
          </Button>

          {/* Share */}
          <Button variant="secondary" size="icon" onPress={handleShareImage}>
            <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
