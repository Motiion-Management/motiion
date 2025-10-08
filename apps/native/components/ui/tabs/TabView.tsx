import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';
import { TabBar } from './TabBar';
import { PillTabs } from './PillTabs';
import { TextTabs } from './TextTabs';

export type TabRoute = { key: string; title: string };

type TabsViewProps = {
  routes: TabRoute[];
  renderScene: (route: TabRoute) => React.ReactNode;
  initialKey?: string;
  onIndexChange?: (index: number, key: string) => void;
  disabledKeys?: string[];
  className?: string;
  /** @deprecated Use tabStyle instead */
  variant?: 'default' | 'pill';
  /** @deprecated Use tabStyle instead */
  alignment?: 'left' | 'center';
  /** Tab style: 'pill' for pill tabs, 'text' for underlined text tabs, 'animated' for scrollable animated tabs */
  tabStyle?: 'pill' | 'text' | 'animated';
  /** ClassName applied to the wrapper around the tab buttons */
  tabContainerClassName?: string;
  /** ClassName applied to each page's content wrapper */
  contentClassName?: string;
};

export function TabView({
  routes,
  renderScene,
  initialKey,
  onIndexChange,
  disabledKeys = [],
  className,
  variant = 'default',
  alignment = 'left',
  tabStyle,
  tabContainerClassName,
  contentClassName,
}: TabsViewProps) {
  const initialIndex = Math.max(0, initialKey ? routes.findIndex((r) => r.key === initialKey) : 0);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const indexDecimal = useSharedValue<number>(initialIndex);
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  const titles = useMemo(() => routes.map((r) => r.title), [routes]);
  const disabledIndices = useMemo(
    () =>
      disabledKeys.map((k) =>
        Math.max(
          0,
          routes.findIndex((r) => r.key === k)
        )
      ),
    [disabledKeys, routes]
  );
  const focusedTab = useSharedValue<string>(routes[initialIndex]?.title ?? titles[0] ?? '');

  const handleTabPress = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    pagerRef.current?.setPage?.(index);
    onIndexChange?.(index, routes[index]?.key);
  };

  // Determine which tab component to render
  const renderTabs = () => {
    // New tabStyle prop takes precedence
    if (tabStyle === 'pill') {
      return <PillTabs tabs={titles} activeIndex={activeIndex} onTabPress={handleTabPress} />;
    }
    if (tabStyle === 'text') {
      return <TextTabs tabs={titles} activeIndex={activeIndex} onTabPress={handleTabPress} />;
    }

    // Fallback to legacy TabBar for backward compatibility
    return (
      <TabBar
        focusedTab={focusedTab}
        indexDecimal={indexDecimal}
        tabNames={titles}
        activeIndex={activeIndex}
        variant={variant}
        alignment={alignment}
        onTabPress={(name) => {
          const index = routes.findIndex((r) => r.title === name);
          if (index < 0) return;
          handleTabPress(index);
        }}
      />
    );
  };

  return (
    <View className={className} style={{ flex: 1 }}>
      <View className={tabContainerClassName}>
        {renderTabs()}
      </View>
      <PagerView
        ref={pagerRef}
        initialPage={initialIndex}
        style={{ flex: 1 }}
        onPageScroll={(e) => {
          const { position = 0, offset = 0 } = e.nativeEvent || {};
          indexDecimal.value = position + offset;
        }}
        onPageSelected={(e) => {
          const idx = e.nativeEvent.position ?? 0;
          if (idx !== activeIndex) {
            setActiveIndex(idx);
            onIndexChange?.(idx, routes[idx]?.key);
          }
          focusedTab.value = routes[idx]?.title ?? '';
        }}>
        {routes.map((r) => (
          <View key={r.key} className={contentClassName ?? 'flex-1'}>
            {renderScene(r)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
