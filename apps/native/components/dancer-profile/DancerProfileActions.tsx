import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import {
  OwnProfileActions,
  DancerViewingDancerActions,
  ChoreographerViewingDancerActions,
} from '~/components/dancer-profile/action-buttons';
import { type DancerViewConfig, type DancerViewActions } from '~/hooks/useDancerView';
import { PROFILE_SHEET_EXPANDED_HEIGHT } from '~/components/profile-sheet/constants';

export interface DancerProfileActionsProps {
  config: DancerViewConfig;
  actions: DancerViewActions;
  animatedIndex: SharedValue<number>;
}

/**
 * Domain component that orchestrates action button rendering based on view type
 * Handles animated positioning synced with bottom sheet
 */
export function DancerProfileActions(props: DancerProfileActionsProps) {
  const { config, actions, animatedIndex } = props;

  // Animated style synced with bottom sheet
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(animatedIndex.value, [0, 1], [20, 0], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: animatedIndex.value > 0.5 ? ('auto' as const) : ('none' as const),
    };
  });

  // Render appropriate action buttons based on view type
  const renderActionButtons = () => {
    switch (config.viewType) {
      case 'own':
        return <OwnProfileActions onQRCodePress={actions.onQRCodePress} />;

      case 'choreographerViewingDancer':
        return (
          <ChoreographerViewingDancerActions
            onBookPress={actions.onBookPress}
            onAddPress={actions.onAddPress}
            onRequestPress={actions.onRequestPress}
          />
        );

      case 'dancerViewingDancer':
        return (
          <DancerViewingDancerActions
            onAddPress={actions.onAddPress}
            onFavoritePress={actions.onFavoritePress}
          />
        );

      case 'guest':
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: `${(97 - PROFILE_SHEET_EXPANDED_HEIGHT) / 2}%`,
          left: 0,
          right: 0,
          zIndex: 5,
          alignItems: 'center',
          // backgroundColor: 'black',
        },
      ]}>
      <View className="flex-row items-center justify-center gap-6">{renderActionButtons()}</View>
    </Animated.View>
  );
}
