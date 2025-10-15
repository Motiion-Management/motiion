import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import {
  HomeHeaderLeft,
  HomeHeaderMiddle,
  HomeHeaderRight,
  HeroCarousel,
  TeachingThisWeekSection,
  InSessionSection,
  ScheduleModal,
  useScheduleModal,
} from '~/components/home';
import {
  heroCarouselItems,
  choreographers,
  sessions,
  classesScheduleItems,
  sessionsScheduleItems,
  scheduleModalDays,
} from '~/data/homeStubData';

function Divider() {
  return <View className="h-px bg-border-tint" />;
}

export default function HomeScreen() {
  const classesModal = useScheduleModal();
  const sessionsModal = useScheduleModal();
  const { bottom } = useSafeAreaInsets();

  return (
    <BackgroundGradientView>
      <TabScreenLayout
        headerConfig={{ threshold: 32 }}
        header={{
          left: <HomeHeaderLeft />,
          middle: (slot) => <HomeHeaderMiddle {...slot} />,
          right: (slot) => <HomeHeaderRight {...slot} />,
        }}
        className="flex-1"
        contentInset={{ bottom: bottom + 90 }}
        contentContainerStyle={{ paddingBottom: bottom + 90 }}>
        <View className="gap-8">
          <HeroCarousel items={heroCarouselItems} />

          <Divider />

          <TeachingThisWeekSection items={choreographers} onViewAllPress={classesModal.open} />

          <Divider />

          <InSessionSection items={sessions} onViewAllPress={sessionsModal.open} />
        </View>
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
      </TabScreenLayout>
    </BackgroundGradientView>
  );
}
