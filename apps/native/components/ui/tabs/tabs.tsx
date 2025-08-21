import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, LayoutChangeEvent, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

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
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [contentWidth, setContentWidth] = useState<number>(0);

  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        tabs.findIndex((t) => t.key === activeTab)
      ),
    [tabs, activeTab]
  );

  const visualProgress = progress != null ? progress : activeIndex;

  // Animated values for smooth transitions
  const animatedProgress = useSharedValue(visualProgress);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // Update animated values when progress changes
  useEffect(() => {
    // Use spring for tab clicks, direct assignment for swipe gestures
    if (progress != null) {
      // Direct assignment for swipe gestures (already smooth from pager)
      animatedProgress.value = visualProgress;
    } else {
      // Spring animation for tab clicks
      animatedProgress.value = withSpring(visualProgress, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
    }
  }, [visualProgress, progress]);

  // Recompute content width when measurements change
  useEffect(() => {
    const last = tabs[tabs.length - 1];
    if (last && tabMeasurements[last.key]) {
      const m = tabMeasurements[last.key];
      setContentWidth(m.x + m.width);
    }
  }, [tabs, tabMeasurements]);

  // Helper: compute smart-centered scrollX for a given fractional index
  const computeScrollOffset = (fractionalIndex: number) => {
    if (!Number.isFinite(fractionalIndex) || containerWidth === 0 || contentWidth === 0) {
      return 0;
    }
    // Clamp index range
    const idx = Math.max(0, Math.min(tabs.length - 1, fractionalIndex));
    const baseIndex = Math.floor(idx);
    const offset = idx - baseIndex;

    const getCenterFor = (i: number) => {
      const t = tabs[i];
      const m = t && tabMeasurements[t.key];
      if (!m) return 0;
      return m.x + m.width / 2;
    };

    const currentCenter = getCenterFor(baseIndex);
    const nextCenter = getCenterFor(Math.min(baseIndex + 1, tabs.length - 1));
    let center = currentCenter;
    if (offset > 0 && nextCenter) {
      center = currentCenter + (nextCenter - currentCenter) * offset;
    }

    const maxOffset = Math.max(contentWidth - containerWidth, 0);

    // If tab can't be centered (near edges), clamp to edges
    const desired = Math.max(0, Math.min(center - containerWidth / 2, maxOffset));
    return desired;
  };

  // Update indicator position based on measurements
  useEffect(() => {
    if (visualProgress >= 0 && visualProgress < tabs.length) {
      const tabIndex = Math.floor(visualProgress);
      const offset = visualProgress - tabIndex;
      const currentTab = tabs[tabIndex];
      const nextTab = tabs[tabIndex + 1];

      const currentMeasurement = tabMeasurements[currentTab?.key];
      const nextMeasurement = tabMeasurements[nextTab?.key];

      if (currentMeasurement) {
        let targetX = currentMeasurement.x;
        let targetWidth = currentMeasurement.width;

        // If animating to next tab, interpolate position and width
        if (offset > 0 && nextMeasurement) {
          targetX = currentMeasurement.x + (nextMeasurement.x - currentMeasurement.x) * offset;
          targetWidth =
            currentMeasurement.width + (nextMeasurement.width - currentMeasurement.width) * offset;
        }

        if (progress != null) {
          // Direct assignment for swipe gestures
          indicatorX.value = targetX;
          indicatorWidth.value = targetWidth;
          // Keep header scrolled to follow swipe progress
          const x = computeScrollOffset(visualProgress);
          scrollRef.current?.scrollTo({ x, animated: false });
        } else {
          // Spring animation for tab clicks
          indicatorX.value = withSpring(targetX, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
          });
          indicatorWidth.value = withSpring(targetWidth, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
          });
          // Ensure active tab is visible by auto-scrolling container, try centering
          const x = computeScrollOffset(visualProgress);
          scrollRef.current?.scrollTo({ x, animated: true });
        }
      }
    }
  }, [visualProgress, tabs, tabMeasurements, progress]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorX.value }],
      width: indicatorWidth.value,
    };
  });

  const handleTabLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabMeasurements((prev) => ({
      ...prev,
      [key]: { x, width },
    }));
  };

  return (
    <View
      className={cn('', className)}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{}}
      >
        <View className="relative flex-row border-b border-border-low">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const disabled = disabledKeys.includes(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                disabled={disabled}
                onPress={() => onTabChange(tab.key)}
                onLayout={(e) => handleTabLayout(tab.key, e)}
              >
                <View className={cn('px-4 py-2.5', disabled && 'opacity-50')}>
                  <Text
                    variant="body"
                    className={cn(
                      'font-medium',
                      isActive ? 'text-text-default' : 'text-text-disabled'
                    )}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {/* Animated indicator that scrolls with content */}
          <Animated.View
            pointerEvents="none"
            className="absolute -bottom-[0.5px] h-[1.5px] bg-border-high"
            style={animatedIndicatorStyle}
          />
        </View>
      </ScrollView>
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

export { TabView } from './TabView'
