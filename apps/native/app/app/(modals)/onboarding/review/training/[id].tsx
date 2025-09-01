import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Button } from '~/components/ui/button'
import X from '~/lib/icons/X'
import { TrainingEditForm } from '~/components/training/TrainingEditForm'

export default function TrainingEditModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isNew = !id || id === 'new'

  return (
    <View className="flex-1 bg-surface-default">
      <SafeAreaView edges={['top', 'left', 'right']}>
        <View className="absolute right-2 top-2 z-10">
          <Button size="icon" variant="plain" onPress={() => router.back()}>
            <X size={24} className="color-icon-default" />
          </Button>
        </View>
      </SafeAreaView>

      <TrainingEditForm
        onClose={() => router.back()}
        afterSubmit={() => router.back()}
        trainingId={isNew ? undefined : (id as any)}
      />
    </View>
  )
}
