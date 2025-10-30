import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';

type PillTabsProps = {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
};

export function PillTabs({ tabs, activeIndex, onTabPress }: PillTabsProps) {
  return (
    <View className="flex-row rounded-[20px] border border-border-low bg-surface-tint p-1">
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabPress(index)}
            className={`h-8 flex-1 items-center justify-center rounded-2xl px-4 py-2 ${
              isActive ? 'bg-button-surface-default' : 'bg-transparent'
            }`}>
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-text-high' : 'text-text-low'}`}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
