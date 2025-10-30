import { type RefObject } from 'react';
import { type ViewStyle } from 'react-native';
import { type SharedValue, type AnimatedStyle } from 'react-native-reanimated';
import type BottomSheet from '@gorhom/bottom-sheet';

export interface UseProfileSheetConfig {
  initialIndex?: number;
  snapPoints?: string[];
  defaultHeaderHeight?: number;
}

export interface UseProfileSheetReturn {
  // Refs and state
  bottomSheetRef: RefObject<BottomSheet | null>;
  animatedIndex: SharedValue<number>;
  snapPoints: string[];
  headerHeight: number;
  setHeaderHeight: (height: number) => void;

  // Navigation methods
  snapToDefault: () => void;
  snapToExpanded: () => void;
  toggle: () => void;

  // Animated styles
  animations: {
    arrowIcon: AnimatedStyle<ViewStyle>;
    personIcon: AnimatedStyle<ViewStyle>;
  };
}

export interface ProfileSheetHeaderProps {
  title: string;
  subtitle?: string;
  agencyLogoUrl?: string | null;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  onLayout: (height: number) => void;
}

export interface ProfileSheetBackgroundProps {
  animatedIndex: SharedValue<number>;
  screenHeight: number;
  headerHeight: number;
}

export interface ProfileSheetHandleProps {
  animatedIndex: SharedValue<number>;
}

export interface ProfileSheetProps {
  // From hook
  bottomSheetRef: RefObject<BottomSheet | null>;
  animatedIndex: SharedValue<number>;
  snapPoints: string[];
  headerHeight: number;
  onHeaderLayout: (height: number) => void;

  // Header config
  title: string;
  subtitle?: string;
  agencyLogoUrl?: string | null;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;

  // Content
  children: React.ReactNode;

  // Optional customization
  enableBackdrop?: boolean;
  enableOverDrag?: boolean;
}
