import React, { useCallback, useMemo, useRef } from 'react'
import { View, Image, TouchableOpacity, Share as RNShare, Clipboard } from 'react-native'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { type BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types'
import Share, { Social } from 'react-native-share'
import { Text } from '~/components/ui/text'
import { Icon } from '~/lib/icons/Icon'

interface ShareBottomSheetProps {
  visible: boolean
  imageUri: string
  shareUrl: string
  onClose: () => void
}

export function ShareBottomSheet({ visible, imageUri, shareUrl, onClose }: ShareBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['75%'], [])

  // Handle backdrop press
  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose]
  )

  // Share handlers
  const handleInstagramStories = useCallback(async () => {
    try {
      await Share.shareSingle({
        social: Social.InstagramStories,
        appId: 'FACEBOOK_APP_ID', // TODO: Replace with actual Facebook App ID
        stickerImage: imageUri,
        attributionURL: shareUrl,
      })
    } catch (error) {
      console.error('Error sharing to Instagram Stories:', error)
    }
  }, [imageUri, shareUrl])

  const handleCopyLink = useCallback(async () => {
    Clipboard.setString(shareUrl)
    // TODO: Show toast notification
    onClose()
  }, [shareUrl, onClose])

  const handleSaveImage = useCallback(async () => {
    // TODO: Implement save to camera roll using expo-media-library
    console.log('Save image not yet implemented')
  }, [])

  const handleMore = useCallback(async () => {
    try {
      await RNShare.share({
        message: shareUrl,
        url: imageUri,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }, [imageUri, shareUrl])

  // Sync sheet state with visible prop
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [visible])

  if (!visible) return null

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#1A2F2B' }}>
      <View className="flex-1 px-6 pb-6">
        {/* Header */}
        <View className="mb-6">
          <Text variant="header3" className="text-text-default">
            Share
          </Text>
        </View>

        {/* Image Preview */}
        <View className="mb-8 items-center">
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />
        </View>

        {/* Share Options */}
        <View className="gap-4">
          {/* Instagram Stories */}
          <TouchableOpacity
            onPress={handleInstagramStories}
            className="flex-row items-center rounded-2xl bg-surface-high p-4">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
              <Icon name="camera.fill" size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="text-text-default">
                Instagram Stories
              </Text>
              <Text variant="labelSm" className="text-text-low">
                Share as a story
              </Text>
            </View>
            <Icon name="chevron.right" size={20} className="text-icon-low" />
          </TouchableOpacity>

          {/* Copy Link */}
          <TouchableOpacity
            onPress={handleCopyLink}
            className="flex-row items-center rounded-2xl bg-surface-high p-4">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="link" size={24} className="text-icon-default" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="text-text-default">
                Copy Link
              </Text>
              <Text variant="labelSm" className="text-text-low">
                Copy profile link
              </Text>
            </View>
            <Icon name="chevron.right" size={20} className="text-icon-low" />
          </TouchableOpacity>

          {/* Save Image */}
          <TouchableOpacity
            onPress={handleSaveImage}
            className="flex-row items-center rounded-2xl bg-surface-high p-4">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="arrow.down.to.line" size={24} className="text-icon-default" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="text-text-default">
                Save Image
              </Text>
              <Text variant="labelSm" className="text-text-low">
                Save to camera roll
              </Text>
            </View>
            <Icon name="chevron.right" size={20} className="text-icon-low" />
          </TouchableOpacity>

          {/* More */}
          <TouchableOpacity
            onPress={handleMore}
            className="flex-row items-center rounded-2xl bg-surface-high p-4">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="square.and.arrow.up" size={24} className="text-icon-default" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="text-text-default">
                More...
              </Text>
              <Text variant="labelSm" className="text-text-low">
                Share via other apps
              </Text>
            </View>
            <Icon name="chevron.right" size={20} className="text-icon-low" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  )
}
