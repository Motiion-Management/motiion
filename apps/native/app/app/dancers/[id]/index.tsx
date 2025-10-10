import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect, Link, useFocusEffect } from 'expo-router';
import { useQuery } from 'convex/react';
// import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
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
import { BottomSheet, Host } from '@expo/ui/swift-ui';

function TopBar() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Navigate to home/default screen
      router.replace('/');
    }
  };
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 8,
        }}>
        {/* Close button (left) */}
        <Button onPress={handleClose} variant="tertiary">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Button variant="tertiary" onPress={() => {}}>
          <Icon name="person.text.rectangle" size={28} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  );
}
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSIBLE_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function DancerScreen() {
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

  const [sheetOpen, setSheetOpen] = useState(true);

  function onSheetCloseIntent() {
    setSheetOpen(false);
  }

  function onSheetOpenIntent() {
    setSheetOpen(true);
  }

  return (
    <View className="flex-1">
      {/* <TopBar /> */}
      <HeadshotCarousel
        headshotUrls={profileData.headshotUrls}
        onSheetOpen={onSheetOpenIntent}
        isSheetOpen={sheetOpen}
      />

      <ProfileDetailsSheet
        profileData={profileData}
        onCollapseIntent={() => {}}
        isOpened={sheetOpen}
        onIsOpenedChange={onSheetCloseIntent}
      />
    </View>
  );
}
