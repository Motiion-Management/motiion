import * as React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface SearchTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface PillTabProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

function PillTab({ title, active, onPress }: PillTabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-[27px] px-4 py-1.5 ${
        active ? 'bg-background-accent' : 'bg-surface-tint'
      }`}>
      <Text variant="bodySm" className="text-text-default">
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function SearchTabs({ tabs, activeTab, onTabChange, className }: SearchTabsProps) {
  return (
    <View className={cn('w-full', className)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="ml-4 gap-2"
        className="flex-row">
        {tabs.map((tab) => {
          return (
            <PillTab
              key={tab}
              title={tab}
              active={activeTab === tab}
              onPress={() => onTabChange(tab)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
