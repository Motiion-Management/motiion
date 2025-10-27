import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ProfileSheetHandle } from './ProfileSheetHandle';
import { ProfileSheetBackground } from './ProfileSheetBackground';
import { ProfileSheetHeader } from './ProfileSheetHeader';
import { type ProfileSheetProps } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ProfileSheet({
  bottomSheetRef,
  animatedIndex,
  snapPoints,
  headerHeight,
  onHeaderLayout,
  title,
  subtitle,
  leftButton,
  rightButton,
  actionButtons,
  children,
  enableBackdrop = true,
  enableOverDrag = false,
}: ProfileSheetProps) {
  // Animation for action buttons - only visible when expanded (index 1)
  const actionButtonsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(animatedIndex.value, [0, 1], [20, 0], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: animatedIndex.value > 0.5 ? ('auto' as const) : ('none' as const),
    };
  });

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableOverDrag={enableOverDrag}
      index={0}
      animatedIndex={animatedIndex}
      enablePanDownToClose={false}
      handleComponent={() => <ProfileSheetHandle animatedIndex={animatedIndex} />}
      backdropComponent={
        enableBackdrop
          ? (props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} disappearsOnIndex={0} />
          : undefined
      }
      backgroundComponent={() => (
        <ProfileSheetBackground
          animatedIndex={animatedIndex}
          screenHeight={SCREEN_HEIGHT}
          headerHeight={headerHeight}
        />
      )}>
      <BottomSheetView
        className="h-[90vh] pb-10"
        style={{ flex: 1, backgroundColor: 'transparent', position: 'relative' }}>
        {/* Action buttons - shown above header when expanded */}
        {actionButtons && (
          <Animated.View
            style={[
              actionButtonsStyle,
              {
                position: 'absolute',
                top: -120,
                left: 0,
                right: 0,
                zIndex: 10,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            {actionButtons}
          </Animated.View>
        )}

        <View className="flex-1">
          <ProfileSheetHeader
            title={title}
            subtitle={subtitle}
            leftButton={leftButton}
            rightButton={rightButton}
            onLayout={onHeaderLayout}
          />
          {children}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
