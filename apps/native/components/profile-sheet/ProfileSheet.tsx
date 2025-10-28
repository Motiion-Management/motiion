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
  children,
  enableBackdrop = true,
  enableOverDrag = false,
}: ProfileSheetProps) {
  // Animated style for content height and border radius
  const contentStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight, SCREEN_HEIGHT],
      Extrapolate.CLAMP
    );

    // Border radius: pill shape at collapsed → rounded corners at expanded
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight / 2, 34],
      Extrapolate.CLAMP
    );
    const borderBottomRadius = headerHeight / 2;

    return {
      height,
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
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
          ? (props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={1}
              disappearsOnIndex={0}
              pressBehavior="collapse"
              opacity={0.6}
            />
          )
          : undefined
      }
      backgroundComponent={() => (
        <ProfileSheetBackground
          animatedIndex={animatedIndex}
          screenHeight={SCREEN_HEIGHT}
          headerHeight={headerHeight}
        />
      )}>
      <BottomSheetView>
        <Animated.View
          style={[
            contentStyle,
            {
              flex: 1,
              backgroundColor: 'transparent',
              position: 'relative',
              overflow: 'hidden',
            },
          ]}>
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
        </Animated.View>
      </BottomSheetView>
    </BottomSheet>
  );
}
