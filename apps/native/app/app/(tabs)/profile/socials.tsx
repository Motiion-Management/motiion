import React from 'react'
import { View, ScrollView } from 'react-native'

import { Text } from '~/components/ui/text'
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import { SocialsForm } from '~/components/forms/onboarding/SocialsForm'

export default function SocialsScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Socials',
      }}>
      <View className="flex-1 px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Description text */}
          <Text variant="body" className="mb-8 text-text-low">
            Add your social media links to share with casting directors and collaborators
          </Text>

          <View className="gap-8">
            {/* Socials form - auto-saves on change */}
            <SocialsForm
              initialValues={{ socials: {} }}
              onSubmit={async () => {}}
              onValidChange={() => {}}
            />
          </View>
        </ScrollView>
      </View>
    </TabScreenLayout>
  )
}
