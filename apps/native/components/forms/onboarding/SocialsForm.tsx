import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { View } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { socialsFormSchema } from '@packages/backend/convex/schemas/fields/socials'

import { SocialCard } from '~/components/socials/SocialCard'
import { SOCIAL_PLATFORMS, type SocialPlatform } from '~/config/socialPlatforms'
import { Separator } from '~/components/ui/separator'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

// Backward compatibility export
export const socialsSchema = socialsFormSchema
export type SocialsValues = { socials?: Record<string, string | undefined> }

export const SocialsForm = forwardRef<FormHandle, FormProps<SocialsValues>>(function SocialsForm(
  { onSubmit, onValidChange },
  ref
) {
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {})
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile)

  const socials = useMemo(() => dancerProfile?.links?.socials || {}, [dancerProfile?.links?.socials])

  const filledSocials = useMemo(
    () => SOCIAL_PLATFORMS.filter((p) => socials[p.key]),
    [socials]
  )

  const emptySocials = useMemo(
    () => SOCIAL_PLATFORMS.filter((p) => !socials[p.key]),
    [socials]
  )

  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({ socials }),
    isDirty: () => false,
    isValid: () => true,
  }))

  useEffect(() => {
    onValidChange?.(true)
  }, [onValidChange])

  const handleSave = async (platform: SocialPlatform, url: string) => {
    try {
      await updateDancerProfile({
        links: {
          ...dancerProfile?.links,
          socials: {
            ...socials,
            [platform]: url,
          },
        },
      })
    } catch (error) {
      console.error('Failed to save social link:', error)
      throw error
    }
  }

  const handleDelete = async (platform: SocialPlatform) => {
    try {
      const updatedSocials = { ...socials }
      delete updatedSocials[platform]

      await updateDancerProfile({
        links: {
          ...dancerProfile?.links,
          socials: updatedSocials,
        },
      })
    } catch (error) {
      console.error('Failed to delete social link:', error)
      throw error
    }
  }

  return (
    <View className="flex-1 gap-4">
      {/* Filled socials at top */}
      {filledSocials.map((platform) => (
        <SocialCard
          key={platform.key}
          platform={platform.key}
          url={socials[platform.key]}
          variant="completed"
          onSave={(url) => handleSave(platform.key, url)}
          onDelete={() => handleDelete(platform.key)}
        />
      ))}

      {/* Separator between filled and empty */}
      {filledSocials.length > 0 && emptySocials.length > 0 && <Separator className="my-2" />}

      {/* Empty socials at bottom */}
      {emptySocials.map((platform) => (
        <SocialCard
          key={platform.key}
          platform={platform.key}
          variant="default"
          onSave={(url) => handleSave(platform.key, url)}
        />
      ))}
    </View>
  )
})
