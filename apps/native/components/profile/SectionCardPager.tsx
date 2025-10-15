import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import PagerView from 'react-native-pager-view';

import { SectionCard } from '~/components/ui/section-card';
import { Text } from '~/components/ui/text';
import PersonCropSquare from '~/lib/icons/PersonCropSquare';
import PhotoTv from '~/lib/icons/PhotoTv';
import Sparkles from '~/lib/icons/Sparkles';
import Ruler from '~/lib/icons/Ruler';
import Globe from '~/lib/icons/Globe';
import Briefcase from '~/lib/icons/Briefcase';
import Rosette from '~/lib/icons/Rosette';
import Studentdesk from '~/lib/icons/Studentdesk';

interface SectionCardConfig {
  title: string;
  icon: React.ReactNode;
  route:
    | '/app/(tabs)/profile/about'
    | '/app/(tabs)/profile/media'
    | '/app/(tabs)/profile/highlights'
    | '/app/(tabs)/profile/sizes'
    | '/app/(tabs)/profile/socials'
    | '/app/(tabs)/profile/agent'
    | '/app/(tabs)/profile/skills'
    | '/app/(tabs)/profile/training';
}

const PAGE_1_CARDS: SectionCardConfig[] = [
  {
    title: 'About',
    icon: <PersonCropSquare className="text-text-default" />,
    route: '/app/(tabs)/profile/about',
  },
  {
    title: 'Media',
    icon: <PhotoTv className="text-text-default" />,
    route: '/app/(tabs)/profile/media',
  },
  {
    title: 'Highlights',
    icon: <Sparkles className="text-text-default" />,
    route: '/app/(tabs)/profile/highlights',
  },
  {
    title: 'Sizes',
    icon: <Ruler className="text-text-default" />,
    route: '/app/(tabs)/profile/sizes',
  },
];

const PAGE_2_CARDS: SectionCardConfig[] = [
  {
    title: 'Socials',
    icon: <Globe className="text-text-default" />,
    route: '/app/(tabs)/profile/socials',
  },
  {
    title: 'Agent',
    icon: <Briefcase className="text-text-default" />,
    route: '/app/(tabs)/profile/agent',
  },
  {
    title: 'Skills',
    icon: <Rosette className="text-text-default" />,
    route: '/app/(tabs)/profile/skills',
  },
  {
    title: 'Training',
    icon: <Studentdesk className="text-text-default" />,
    route: '/app/(tabs)/profile/training',
  },
];

interface DotIndicatorProps {
  totalPages: number;
  activePage: number;
}

function DotIndicator({ totalPages, activePage }: DotIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          className={`h-2 w-2 rounded-full ${
            index === activePage ? 'bg-background-accent' : 'bg-surface-tint'
          }`}
        />
      ))}
    </View>
  );
}

interface SectionCardGridProps {
  cards: SectionCardConfig[];
}

function SectionCardGrid({ cards }: SectionCardGridProps) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        <TouchableOpacity
          className="flex-1"
          onPress={() => router.push(cards[0]?.route)}
          activeOpacity={0.7}>
          <View className="h-[86px] flex-col justify-end rounded-lg border border-border-tint bg-surface-tint-accent p-4">
            <View className="absolute right-4 top-2">{cards[0]?.icon}</View>
            <Text variant="header6" className="text-text-default">
              {cards[0]?.title}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1"
          onPress={() => router.push(cards[1]?.route)}
          activeOpacity={0.7}>
          <View className="h-[86px] flex-col justify-end rounded-lg border border-border-tint bg-surface-tint-accent p-4">
            <View className="absolute right-4 top-2">{cards[1]?.icon}</View>
            <Text variant="header6" className="text-text-default">
              {cards[1]?.title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-4">
        <TouchableOpacity
          className="flex-1"
          onPress={() => router.push(cards[2]?.route)}
          activeOpacity={0.7}>
          <View className="h-[86px] flex-col justify-end rounded-lg border border-border-tint bg-surface-tint-accent p-4">
            <View className="absolute right-4 top-2">{cards[2]?.icon}</View>
            <Text variant="header6" className="text-text-default">
              {cards[2]?.title}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1"
          onPress={() => router.push(cards[3]?.route)}
          activeOpacity={0.7}>
          <View className="h-[86px] flex-col justify-end rounded-lg border border-border-tint bg-surface-tint-accent p-4">
            <View className="absolute right-4 top-2">{cards[3]?.icon}</View>
            <Text variant="header6" className="text-text-default">
              {cards[3]?.title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SectionCardPager() {
  const [activePage, setActivePage] = useState(0);

  return (
    <View className="gap-6">
      <View className="h-[196px]">
        <PagerView
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActivePage(e.nativeEvent.position)}>
          <View key="page-1" className="px-4">
            <SectionCardGrid cards={PAGE_1_CARDS} />
          </View>
          <View key="page-2" className="px-4">
            <SectionCardGrid cards={PAGE_2_CARDS} />
          </View>
        </PagerView>
      </View>
      <DotIndicator totalPages={2} activePage={activePage} />
    </View>
  );
}
