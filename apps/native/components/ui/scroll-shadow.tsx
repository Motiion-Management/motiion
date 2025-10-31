import React, { useCallback, useState } from 'react';
import { View, ScrollView, type ScrollViewProps, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface ScrollShadowProps extends ScrollViewProps {
  /** Height of the fade gradient in pixels */
  size?: number;
  /** Children to render inside the ScrollView */
  children: React.ReactNode;
}

/**
 * ScrollView with opacity fade at top edge using MaskedView.
 * Provides a static gradient fade effect for smooth visual transitions.
 */
export function ScrollShadow({
  size = 40,
  children,
  style,
  onLayout,
  ...scrollViewProps
}: ScrollShadowProps) {
  const [containerHeight, setContainerHeight] = useState(0);

  const handleContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setContainerHeight(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [onLayout]
  );

  // Calculate static gradient locations
  const locations = React.useMemo(() => {
    if (containerHeight === 0) return [0, 0.1, 0.9, 1] as const;

    const topFadeEnd = size / containerHeight;
    const bottomFadeStart = (containerHeight - size) / containerHeight;

    return [
      0, // Top edge
      Math.min(topFadeEnd, 0.4), // End of top fade
      Math.max(bottomFadeStart, 0.6), // Start of bottom fade
      1, // Bottom edge
    ] as const;
  }, [containerHeight, size]);

  // Static gradient - always show top fade, no bottom fade
  const maskColors = React.useMemo(() => {
    const transparent = 'rgba(255, 255, 255, 0)';
    const opaque = 'rgba(255, 255, 255, 1)';

    return [
      transparent, // Top edge (always faded)
      opaque, // After top fade
      opaque, // Before bottom
      opaque, // Bottom edge (no fade)
    ] as const;
  }, []);

  return (
    <View style={[{ flex: 1 }, style]} onLayout={handleContainerLayout}>
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          <LinearGradient colors={maskColors} locations={locations} style={{ flex: 1 }} />
        }>
        <ScrollView {...scrollViewProps}>{children}</ScrollView>
      </MaskedView>
    </View>
  );
}
