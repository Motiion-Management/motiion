import React, { useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, LayoutChangeEvent } from 'react-native';

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
  // Optional: animated progress from a pager (0..tabs.length-1 + offset)
  progress?: number;
  // Optional: disable certain tabs by key
  disabledKeys?: string[];
}

export function Tabs({ tabs, activeTab, onTabChange, className, progress, disabledKeys = [] }: TabsProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };
  const tabWidth = tabs.length > 0 && width > 0 ? width / tabs.length : 0;
  const activeIndex = useMemo(() => Math.max(0, tabs.findIndex((t) => t.key === activeTab)), [tabs, activeTab]);
  const visualProgress = progress != null ? progress : activeIndex;

  return (
    <View className={cn('border-b border-border-default', className)} onLayout={onLayout}>
      <View className="relative flex-row">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const disabled = disabledKeys.includes(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              disabled={disabled}
              onPress={() => onTabChange(tab.key)}
              className="flex-1">
              <View className={cn('items-center py-3', disabled && 'opacity-50')}>
                <Text
                  variant="body"
                  className={cn('font-medium', isActive ? 'text-text-default' : 'text-text-low')}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {/* Animated indicator */}
        {tabWidth > 0 && (
          <View
            pointerEvents="none"
            className="absolute bottom-0 h-0.5 bg-border-accent"
            style={{ width: tabWidth, transform: [{ translateX: tabWidth * visualProgress }] }}
          />
        )}
      </View>
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
