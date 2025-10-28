import { useCallback, useRef, useState } from 'react'
import { View, Share } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { type Id } from '@packages/backend/convex/_generated/dataModel'

export interface ShareData {
  imageUri: string
  shareUrl: string
}

export interface UseProfileShareOptions {
  profileId: Id<'dancers'>
  enabled?: boolean
}

export interface UseProfileShareResult {
  // State
  shareSheetVisible: boolean
  shareData: ShareData | null

  // Actions
  shareProfile: () => Promise<void>
  shareHeadshot: () => Promise<void>
  shareProfileLink: () => Promise<void>
  closeShareSheet: () => void

  // Refs for capture
  profileShareCardRef: React.RefObject<View | null>
  headshotShareCardRef: React.RefObject<View | null>
}

/**
 * Hook to manage profile sharing functionality including card capture and native share
 */
export function useProfileShare(options: UseProfileShareOptions): UseProfileShareResult {
  const { profileId, enabled = true } = options

  const [shareSheetVisible, setShareSheetVisible] = useState(false)
  const [shareData, setShareData] = useState<ShareData | null>(null)

  const profileShareCardRef = useRef<View>(null)
  const headshotShareCardRef = useRef<View>(null)

  const shareProfile = useCallback(async () => {
    if (!enabled || !profileShareCardRef.current) return

    // Wait for view to be fully mounted and rendered
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const imageUri = await captureRef(profileShareCardRef, {
        result: 'tmpfile',
        quality: 1,
        format: 'png',
      })
      const shareUrl = `https://motiion.io/app/dancers/${profileId}`
      setShareData({ imageUri, shareUrl })
      setShareSheetVisible(true)
    } catch (error) {
      console.error('Error capturing profile card:', error)
    }
  }, [enabled, profileId])

  const shareHeadshot = useCallback(async () => {
    if (!enabled || !headshotShareCardRef.current) return

    // Wait for view to be fully mounted and rendered
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const imageUri = await captureRef(headshotShareCardRef, {
        result: 'tmpfile',
        quality: 1,
        format: 'png',
      })

      // Share directly with native share sheet
      await Share.share({
        url: imageUri,
        message: `Check out this photo on Motiion!\n\nhttps://motiion.io/app/dancers/${profileId}`,
      })
    } catch (error) {
      console.error('Error sharing headshot:', error)
    }
  }, [enabled, profileId])

  const shareProfileLink = useCallback(async () => {
    if (!enabled) return

    try {
      const profileLink = `https://motiion.io/app/dancers/${profileId}`
      await Share.share({
        message: `Check out my profile on Motiion\n\n${profileLink}`,
      })
    } catch (error) {
      console.error('Error sharing profile link:', error)
    }
  }, [enabled, profileId])

  const closeShareSheet = useCallback(() => {
    setShareSheetVisible(false)
  }, [])

  return {
    // State
    shareSheetVisible,
    shareData,

    // Actions
    shareProfile,
    shareHeadshot,
    shareProfileLink,
    closeShareSheet,

    // Refs
    profileShareCardRef,
    headshotShareCardRef,
  }
}
