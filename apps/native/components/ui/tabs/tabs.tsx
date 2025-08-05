import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <View className={cn('flex-row border-b border-border-default', className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onTabChange(tab.key)} className="flex-1">
            <View
              className={cn('items-center py-3', isActive && 'border-b-2 border-border-accent')}>
              <Text
                variant="body"
                className={cn('font-medium', isActive ? 'text-text-default' : 'text-text-low')}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface TabPanelProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ isActive, children, className }: TabPanelProps) {
  if (!isActive) return null;

  return <View className={cn('flex-1', className)}>{children}</View>;
}
