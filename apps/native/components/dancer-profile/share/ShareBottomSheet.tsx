import React, { useCallback } from 'react';
import { View, Image, Share as RNShare, Clipboard } from 'react-native';
import Share, { Social } from 'react-native-share';
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
  // Share handlers
  const handleInstagramStories = useCallback(async () => {
    try {
      await Share.shareSingle({
        social: Social.InstagramStories,
        appId: 'FACEBOOK_APP_ID', // TODO: Replace with actual Facebook App ID
        stickerImage: imageUri,
        attributionURL: shareUrl,
      });
    } catch (error) {
      console.error('Error sharing to Instagram Stories:', error);
    }
  }, [imageUri, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    Clipboard.setString(shareUrl);
    // TODO: Show toast notification
    onClose();
  }, [shareUrl, onClose]);

  const handleSaveImage = useCallback(async () => {
    // TODO: Implement save to camera roll using expo-media-library
    console.log('Save image not yet implemented');
  }, []);

  const handleMore = useCallback(async () => {
    try {
      await RNShare.share({
        message: shareUrl,
        url: imageUri,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [imageUri, shareUrl]);

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
              width: 280,
              height: 280,
              borderRadius: 20,
            }}
            resizeMode="cover"
          />
        </View>

        {/* Share Actions - Horizontal Icon Row */}
        <View className="flex-row items-center justify-center gap-4">
          {/* Save */}
          <Button variant="secondary" size="icon" onPress={handleSaveImage}>
            <Icon name="arrow.down.to.line" size={24} className="text-icon-default" />
          </Button>

          {/* Copy Link */}
          <Button variant="secondary" size="icon" onPress={handleCopyLink}>
            <Icon name="link" size={24} className="text-icon-default" />
          </Button>

          {/* Instagram Stories */}
          <Button variant="secondary" size="icon" onPress={handleInstagramStories}>
            <Icon name="camera.fill" size={24} className="text-icon-default" />
          </Button>

          {/* More */}
          <Button variant="secondary" size="icon" onPress={handleMore}>
            <Icon name="ellipsis" size={24} className="text-icon-default" />
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
