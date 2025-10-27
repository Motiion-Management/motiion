import React, { useState, useCallback } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { Text } from '~/components/ui/text'
import { cn } from '~/lib/cn'
import Check from '~/lib/icons/Check'
import Plus from '~/lib/icons/Plus'
import { type SocialPlatform, getSocialPlatformConfig } from '~/config/socialPlatforms'
import { SocialEditSheet } from './SocialEditSheet'

const socialCardVariants = cva(
  'w-full flex-row items-center justify-between rounded-full border px-5 py-4',
  {
    variants: {
      variant: {
        default: 'border-border-default bg-surface-high',
        completed: 'border-border-accent bg-surface-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface SocialCardProps extends VariantProps<typeof socialCardVariants> {
  platform: SocialPlatform
  url?: string
  onSave: (url: string) => Promise<void>
  onDelete?: () => Promise<void>
  className?: string
}

export function SocialCard({
  platform,
  url,
  variant,
  onSave,
  onDelete,
  className,
}: SocialCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const config = getSocialPlatformConfig(platform)

  const handlePress = useCallback(() => {
    setIsSheetOpen(true)
  }, [])

  const hasSocial = !!url
  const displayVariant = hasSocial ? 'completed' : variant || 'default'
  const displayText = hasSocial ? config?.displayName : `Add ${config?.name}`

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className={cn(socialCardVariants({ variant: displayVariant }), className)}>
        <View className="flex-1 px-2">
          <Text
            variant="body"
            className={cn('font-medium', hasSocial ? 'text-text-default' : 'text-text-low')}>
            {displayText}
          </Text>
        </View>
        <View className="ml-3">
          {hasSocial ? (
            <Check className="h-5 w-5 text-icon-accent" />
          ) : (
            <Plus className="h-5 w-5 text-icon-low" />
          )}
        </View>
      </TouchableOpacity>

      <SocialEditSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        platform={platform}
        currentUrl={url}
        onSave={onSave}
        onDelete={onDelete}
      />
    </>
  )
}
