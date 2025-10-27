import React, { useState, useEffect } from 'react'
import { View } from 'react-native'

import { Sheet } from '~/components/ui/sheet'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Icon } from '~/lib/icons/Icon'
import { type SocialPlatform, getSocialPlatformConfig } from '~/config/socialPlatforms'

interface SocialEditSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  platform: SocialPlatform
  currentUrl?: string
  onSave: (url: string) => Promise<void>
  onDelete?: () => Promise<void>
}

export function SocialEditSheet({
  isOpen,
  onOpenChange,
  platform,
  currentUrl,
  onSave,
  onDelete,
}: SocialEditSheetProps) {
  const [url, setUrl] = useState(currentUrl || '')
  const [isSaving, setIsSaving] = useState(false)
  const config = getSocialPlatformConfig(platform)

  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl || '')
    }
  }, [isOpen, currentUrl])

  const handleSave = async () => {
    if (!url.trim()) return

    setIsSaving(true)
    try {
      await onSave(url.trim())
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save social link:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsSaving(true)
    try {
      await onDelete()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete social link:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isEditing = !!currentUrl

  return (
    <Sheet
      isOpened={isOpen}
      onIsOpenedChange={onOpenChange}
      label={isEditing ? `Edit ${config?.name}` : `Add ${config?.displayName}`}>
      <View className="gap-6 px-4 pb-8">
        {/* URL Input */}
        <View className="relative">
          <Input
            value={url}
            onChangeText={setUrl}
            placeholder={config?.placeholder || 'Enter link'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="pr-12"
          />
          <View className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="link" size={20} className="text-icon-low" />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            onPress={handleSave}
            disabled={!url.trim() || isSaving}
            className="w-full">
            <Text variant="body" className="font-semibold text-text-on-accent">
              {isSaving ? 'Saving...' : 'Save Link'}
            </Text>
          </Button>

          {isEditing && onDelete && (
            <Button
              variant="secondary"
              onPress={handleDelete}
              disabled={isSaving}
              className="w-full">
              <Text variant="body" className="font-semibold text-text-default">
                Delete Link
              </Text>
            </Button>
          )}
        </View>
      </View>
    </Sheet>
  )
}
