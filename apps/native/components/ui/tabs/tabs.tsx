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

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  progress,
  disabledKeys = [],
}: TabsProps) {
  const [tabMeasurements, setTabMeasurements] = useState<{
    [key: string]: { x: number; width: number };
  }>({});

  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        tabs.findIndex((t) => t.key === activeTab)
      ),
    [tabs, activeTab]
  );

  const visualProgress = progress != null ? progress : activeIndex;

  // Calculate indicator position and width based on measurements
  const indicatorStyle = useMemo(() => {
    if (visualProgress >= 0 && visualProgress < tabs.length) {
      const tabIndex = Math.floor(visualProgress);
      const offset = visualProgress - tabIndex;
      const currentTab = tabs[tabIndex];
      const nextTab = tabs[tabIndex + 1];

      const currentMeasurement = tabMeasurements[currentTab?.key];
      const nextMeasurement = tabMeasurements[nextTab?.key];

      if (currentMeasurement) {
        let x = currentMeasurement.x;
        let width = currentMeasurement.width;

        // If animating to next tab, interpolate position and width
        if (offset > 0 && nextMeasurement) {
          x = currentMeasurement.x + (nextMeasurement.x - currentMeasurement.x) * offset;
          width =
            currentMeasurement.width + (nextMeasurement.width - currentMeasurement.width) * offset;
        }

        return { width, transform: [{ translateX: x }] };
      }
    }
    return { width: 0, transform: [{ translateX: 0 }] };
  }, [visualProgress, tabs, tabMeasurements]);

  const handleTabLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabMeasurements((prev) => ({
      ...prev,
      [key]: { x, width },
    }));
  };

  return (
    <View className={cn('', className)}>
      <View className="relative flex-row border-b border-border-low">
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab;
          const disabled = disabledKeys.includes(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              disabled={disabled}
              onPress={() => onTabChange(tab.key)}
              onLayout={(e) => handleTabLayout(tab.key, e)}>
              <View className={cn('px-4 py-2.5', disabled && 'opacity-50')}>
                <Text
                  variant="body"
                  className={cn(
                    'font-medium',
                    isActive ? 'text-text-default' : 'text-text-disabled'
                  )}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {/* Animated indicator */}
        {indicatorStyle.width > 0 && (
          <View
            pointerEvents="none"
            className="absolute -bottom-[0.5px] h-[1.5px] bg-border-high"
            style={indicatorStyle}
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
