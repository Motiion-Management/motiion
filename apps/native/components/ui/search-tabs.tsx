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

export function SearchTabs({ tabs, activeTab, onTabChange, className }: SearchTabsProps) {
  return (
    <View className={cn('w-full', className)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4"
        className="flex-row">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
              className={cn(
                'rounded-[27px] border px-4 py-2',
                isActive
                  ? 'border-border-accent bg-background-accent'
                  : 'border-transparent bg-surface-tint'
              )}>
              <Text
                variant="bodySm"
                className={cn(isActive ? 'text-text-default' : 'text-text-low')}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
