import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect, Link } from 'expo-router';
import { useQuery } from 'convex/react';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { ProfileActionButtons } from '~/components/dancer-profile/ProfileActionButtons';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { TypecastDetails } from '~/components/dancer-profile/TypecastDetails';

export default function DancerProfileDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  );

  if (profileData === undefined) {
    return null;
  }

  if (profileData === null) {
    return <Redirect href="/app/home" />;
  }
  return (
    <View className="flex-1">
      <View className="z-10 items-center px-4">
        <Text variant="header3">{profileData.dancer.displayName}</Text>
        <Text variant="body">
          {profileData.dancer?.location?.city}, {profileData.dancer?.location?.state}
        </Text>
      </View>
      {/* <ProjectCarousel projects={profileData.recentProjects} /> */}
      {/* <TypecastDetails dancer={profileData.dancer} /> */}
      {/* <ProfileDetailsSheet profileData={profileData} onCollapseIntent={() => {}} /> */}
    </View>
  );
}
