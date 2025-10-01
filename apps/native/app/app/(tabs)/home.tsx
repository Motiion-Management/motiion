import * as React from 'react'
import { View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BackgroundGradientView } from '~/components/ui/background-gradient-view'
import {
  HomeHeader,
  HeroCarousel,
  TeachingThisWeekSection,
  InSessionSection,
  ScheduleModal,
  useScheduleModal,
} from '~/components/home'
import {
  heroCarouselItems,
  choreographers,
  sessions,
  classesScheduleItems,
  sessionsScheduleItems,
  scheduleModalDays,
} from '~/data/homeStubData'

export default function HomeScreen() {
  const classesModal = useScheduleModal()
  const sessionsModal = useScheduleModal()

  return (
    <BackgroundGradientView>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <HomeHeader />

        {/* Scrollable content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
          {/* Hero Carousel */}
          <View className="mb-8 px-4">
            <HeroCarousel items={heroCarouselItems} />
          </View>

          {/* Divider */}
          <View className="mb-12 h-px bg-border-low" />

          {/* Teaching This Week Section */}
          <View className="mb-12">
            <TeachingThisWeekSection
              items={choreographers}
              onViewAllPress={classesModal.open}
            />
          </View>

          {/* Divider */}
          <View className="mb-12 h-px bg-border-low" />

          {/* In Session Section */}
          <View className="mb-12">
            <InSessionSection items={sessions} onViewAllPress={sessionsModal.open} />
          </View>

          {/* Divider */}
          <View className="h-px bg-border-low" />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ScheduleModal
        isOpen={classesModal.isOpen}
        onClose={classesModal.close}
        title="Classes"
        dateRange="AUG 19 - AUG 25"
        days={scheduleModalDays}
        items={classesScheduleItems}
      />

      <ScheduleModal
        isOpen={sessionsModal.isOpen}
        onClose={sessionsModal.close}
        title="Sessions"
        dateRange="AUG 19 - AUG 25"
        days={scheduleModalDays}
        items={sessionsScheduleItems}
      />
    </BackgroundGradientView>
  )
}
