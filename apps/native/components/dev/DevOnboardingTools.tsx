import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { useUser } from '~/hooks/useUser'
import { Sheet, useSheetState } from '~/components/ui/sheet'

// Local copy of step lists for quick navigation
const ONBOARDING_FLOWS = {
  dancer: [
    'profile-type',
    'headshots',
    'height',
    'ethnicity',
    'hair-color',
    'eye-color',
    'gender',
    'sizing',
    'location',
    'work-location',
    'representation',
    'agency',
    'resume',
    'experiences',
    'training',
    'skills',
    'union',
    'complete',
  ],
  choreographer: [
    'profile-type',
    'headshots',
    'location',
    'representation',
    'agency',
    'resume',
    'experiences',
    'complete',
  ],
  guest: ['profile-type', 'database-use', 'company', 'complete'],
} as const

type ProfileType = keyof typeof ONBOARDING_FLOWS

export function DevOnboardingTools() {
  if (!__DEV__) return null

  const { user } = useUser()
  const onboarding = useSimpleOnboardingFlow()
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding)
  const resetOnboarding = useMutation(api.onboarding.resetOnboarding)
  const updateMyUser = useMutation(api.users.updateMyUser)
  const sheetState = useSheetState()
  const activeProfileType: ProfileType = (user?.profileType as ProfileType) || 'dancer'
  const activeSteps = useMemo(() => ONBOARDING_FLOWS[activeProfileType], [activeProfileType])

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 20, right: 16, left: 16, zIndex: 1000 }}>
      <Sheet
        isOpened={sheetState.isOpen}
        label="Dev: Onboarding Tools"
        onIsOpenedChange={(isOpen) => {
          if (!isOpen) sheetState.close()
        }}
        stackBehavior="push">
        <View className="px-4 pb-4">
          <View className="mb-2 flex-row gap-2">
            <Button
              size="sm"
              variant="secondary"
              onPress={async () => {
                try {
                  await resetOnboarding({})
                  onboarding.navigateToStep('profile-type')
                } catch {}
              }}>
              <Text variant="bodySm">Reset</Text>
            </Button>
            <Button
              size="sm"
              variant="accent"
              onPress={async () => {
                try {
                  await completeOnboarding({})
                } catch {}
              }}>
              <Text variant="bodySm">Complete</Text>
            </Button>
          </View>

          <Text className="mb-1" variant="bodySm">
            Profile Type
          </Text>
          <View className="mb-2 flex-row gap-2">
            {(['dancer', 'choreographer', 'guest'] as ProfileType[]).map((pt) => (
              <Button
                key={pt}
                size="sm"
                variant={activeProfileType === pt ? 'accent' : 'secondary'}
                onPress={async () => {
                  await updateMyUser({ profileType: pt })
                  const flow = ONBOARDING_FLOWS[pt]
                  const next = flow[1] || 'profile-type'
                  onboarding.navigateToStep(next)
                }}>
                <Text variant="bodySm">{pt}</Text>
              </Button>
            ))}
          </View>

          <Text className="mb-1" variant="bodySm">
            Representation Status
          </Text>
          <View className="mb-2 flex-row gap-2">
            {(['represented', 'seeking', 'independent'] as const).map((rs) => (
              <Button
                key={rs}
                size="sm"
                variant={user?.representationStatus === rs ? 'accent' : 'secondary'}
                onPress={async () => {
                  await updateMyUser({ representationStatus: rs })
                }}>
                <Text variant="bodySm">{rs}</Text>
              </Button>
            ))}
          </View>

          <Text className="mb-1" variant="bodySm">
            Steps ({activeProfileType})
          </Text>
          <View style={{ maxHeight: 220 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6 }}>
              {activeSteps.map((step) => (
                <TouchableOpacity
                  key={step}
                  onPress={() => onboarding.navigateToStep(step)}
                  style={{ marginRight: 8 }}>
                  <View
                    className={`rounded-full border px-3 py-1 ${
                      onboarding.currentStepId === step
                        ? 'border-accent/60 bg-accent/20'
                        : 'border-border-subtle bg-surface-default/80'
                    }`}>
                    <Text variant="bodySm">{step}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Sheet>

      <View className="items-end">
        <Button size="sm" variant={'secondary'} onPress={sheetState.open}>
          <Text variant="bodySm">Dev</Text>
        </Button>
      </View>
    </View>
  )
}

export default DevOnboardingTools
