import React, { useMemo, useEffect, useRef } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';

type TabKey = string;

interface TabDef {
  key: TabKey;
}

interface TabContentProps {
  tabs: TabDef[];
  activeKey: TabKey;
  onChange: (key: TabKey) => void;
  onProgressChange?: (progress: number) => void;
  children: Record<TabKey, React.ReactNode>;
  className?: string;
}

export function TabContent({
  tabs,
  activeKey,
  onChange,
  onProgressChange,
  children,
  className,
}: TabContentProps) {
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  const indexForKey = useMemo(() => {
    const map = new Map<TabKey, number>();
    tabs.forEach((t, i) => map.set(t.key, i));
    return map;
  }, [tabs]);

  // Keep pager in sync when active key changes from outside (tab click)
  useEffect(() => {
    const idx = indexForKey.get(activeKey);
    if (idx != null) {
      pagerRef.current?.setPage?.(idx);
    }
  }, [activeKey, indexForKey]);

  return (
    <PagerView
      ref={pagerRef}
      initialPage={indexForKey.get(activeKey) ?? 0}
      style={{ flex: 1 }}
      onPageScroll={(e) => {
        const { position = 0, offset = 0 } = e.nativeEvent || {};
        onProgressChange?.(position + offset);
      }}
      onPageSelected={(e) => {
        const idx = e.nativeEvent.position ?? 0;
        const nextKey = tabs[idx]?.key;
        if (nextKey && nextKey !== activeKey) onChange(nextKey);
      }}>
      {tabs.map((t) => (
        <View key={t.key} className={className ?? 'flex-1'}>
          {children[t.key]}
        </View>
      ))}
    </PagerView>
  );
}
