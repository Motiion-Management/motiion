import React from 'react'
import { View, ScrollView } from 'react-native'

import { Text } from '~/components/ui/text'
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import { TrainingForm } from '~/components/forms/onboarding/TrainingForm'

export default function TrainingScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Training',
      }}>
      <View className="flex-1 px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Description text */}
          <Text variant="body" className="mb-8 text-text-low">
            Add your training
          </Text>

          {/* Training form - self-contained with TrainingCards */}
          <TrainingForm
            initialValues={{}}
            onSubmit={async () => {}}
            onValidChange={() => {}}
          />
        </ScrollView>
      </View>
    </TabScreenLayout>
  )
}
