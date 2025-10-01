import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '~/components/ui/text'
import { BackgroundGradientView } from '~/components/ui/background-gradient-view'

export default function NotificationsScreen() {
  return (
    <BackgroundGradientView>
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-4">
          <Text variant="header3" className="text-white">
            Notifications
          </Text>
          <Text variant="body" className="mt-4 text-center text-text-low">
            Notifications feature coming soon
          </Text>
        </View>
      </SafeAreaView>
    </BackgroundGradientView>
  )
}
