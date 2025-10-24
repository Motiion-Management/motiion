import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader';
import { SectionCardPager } from '~/components/profile/SectionCardPager';
import { ProfessionalExperienceSection } from '~/components/profile/ProfessionalExperienceSection';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function ProfileScreen() {
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);

  const animatedHeight = useSharedValue(1);
  const animatedOpacity = useSharedValue(1);

  useEffect(() => {
    animatedHeight.value = withTiming(isHeaderOpen ? 1 : 0, { duration: 300 });
    animatedOpacity.value = withTiming(isHeaderOpen ? 1 : 0, { duration: 300 });
  }, [isHeaderOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight > 0 ? headerHeight * animatedHeight.value : undefined,
      opacity: animatedOpacity.value,
      overflow: 'hidden',
    };
  });

  function handleHeaderToggle() {
    setIsHeaderOpen(!isHeaderOpen);
  }

  return (
    <TabScreenLayout
      header={{
        middle: ProfileHeaderTitle,
        right: ProfileHeaderSettingsButton,
      }}>
      <View className="gap-8">
        <Animated.View
          className="gap-8"
          style={animatedStyle}
          onLayout={(event) => {
            if (headerHeight === 0) {
              setHeaderHeight(event.nativeEvent.layout.height);
            }
          }}>
          {/* Section Cards Pager */}
          <SectionCardPager />

          {/* Divider */}
          <View className="mx-4 h-px bg-border-tint" />
        </Animated.View>

        {/* Professional Experience Section */}
        <View className="px-4">
          <ProfessionalExperienceSection
            isHeaderOpen={isHeaderOpen}
            onHeaderChangeIntent={handleHeaderToggle}
          />
        </View>
      </View>
    </TabScreenLayout>
  );
}
