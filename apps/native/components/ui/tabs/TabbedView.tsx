import React, { useState } from 'react';
import { View } from 'react-native';
import { SearchTabs } from '~/components/ui/search-tabs';

interface TabbedViewProps {
  tabs: string[];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * TabbedView - Simple tab switching with SearchTabs (accent-colored pills)
 * Use this for content that doesn't need swipe gestures (profile sections, filters, etc.)
 * For swipeable pages, use PagerTabView instead.
 */
export function TabbedView({
  tabs,
  initialTab,
  onTabChange,
  children,
  className,
  contentClassName,
}: TabbedViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View className={className}>
      <SearchTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      <View className={contentClassName}>{children(activeTab)}</View>
    </View>
  );
}
