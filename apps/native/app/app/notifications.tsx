import React, { useState } from 'react'
import { View, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackgroundGradientView } from '~/components/ui/background-gradient-view'
import {
  NotificationsHeader,
  NotificationFilters,
  NotificationItem,
  type NotificationTab,
} from '~/components/notifications'
import { getNotificationsByType, getUnreadCount } from '~/data/notificationsStubData'

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('general')

  const notifications = getNotificationsByType(activeTab)
  const generalCount = getUnreadCount('general')
  const requestsCount = getUnreadCount('request')

  const handleNotificationPress = (id: string) => {
    // TODO: Navigate to notification detail
    console.log('Notification pressed:', id)
  }

  return (
    <BackgroundGradientView>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <NotificationsHeader />

        {/* Filters */}
        <NotificationFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          generalCount={generalCount}
          requestsCount={requestsCount}
        />

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem {...item} onPress={() => handleNotificationPress(item.id)} />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    </BackgroundGradientView>
  )
}
