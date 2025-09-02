import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';
import { TabBar } from './TabBar';

export type TabRoute = { key: string; title: string };

type TabsViewProps = {
  routes: TabRoute[];
  renderScene: (route: TabRoute) => React.ReactNode;
  initialKey?: string;
  onIndexChange?: (index: number, key: string) => void;
  disabledKeys?: string[];
  className?: string;
};

export function TabView({
  routes,
  renderScene,
  initialKey,
  onIndexChange,
  disabledKeys = [],
  className,
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

  return (
    <View className={className} style={{ flex: 1 }}>
      <TabBar
        focusedTab={focusedTab}
        indexDecimal={indexDecimal}
        tabNames={titles}
        onTabPress={(name) => {
          const index = routes.findIndex((r) => r.title === name);
          if (index < 0) return;
          if (index === activeIndex) return;
          setActiveIndex(index);
          pagerRef.current?.setPage?.(index);
          onIndexChange?.(index, routes[index]?.key);
        }}
      />
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
          <View key={r.key} className="flex-1">
            {renderScene(r)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
