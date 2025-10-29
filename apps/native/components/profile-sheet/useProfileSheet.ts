import { useRef, useState, useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import type BottomSheet from '@gorhom/bottom-sheet';
import { type UseProfileSheetConfig, type UseProfileSheetReturn } from './types';
import { PROFILE_SHEET_EXPANDED_HEIGHT } from './constants';

export function useProfileSheet(config?: UseProfileSheetConfig): UseProfileSheetReturn {
  const { initialIndex = 0, snapPoints: customSnapPoints, defaultHeaderHeight = 80 } = config || {};

  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(initialIndex);
  const snapPoints = useMemo(() => customSnapPoints || ['15%', `${PROFILE_SHEET_EXPANDED_HEIGHT}%`], [customSnapPoints]);
  const [headerHeight, setHeaderHeight] = useState(defaultHeaderHeight);

  // Navigation methods
  const snapToDefault = () => bottomSheetRef.current?.snapToIndex(0);
  const snapToExpanded = () => bottomSheetRef.current?.snapToIndex(1);
  const toggle = () => {
    // Toggle between default (0 = 30%) and expanded (1 = 70%)
    const targetIndex = animatedIndex.value >= 0.5 ? 0 : 1;
    bottomSheetRef.current?.snapToIndex(targetIndex);
  };

  // Animated styles for toggle button icons
  const arrowIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const personIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  return {
    // Refs and state
    bottomSheetRef,
    animatedIndex,
    snapPoints,
    headerHeight,
    setHeaderHeight,

    // Navigation methods
    snapToDefault,
    snapToExpanded,
    toggle,

    // Animated styles
    animations: {
      arrowIcon: arrowIconStyle,
      personIcon: personIconStyle,
    },
  };
}
