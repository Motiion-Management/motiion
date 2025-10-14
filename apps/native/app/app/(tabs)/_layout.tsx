import { NativeTabs, Icon as NativeTabIcon, Label } from 'expo-router/unstable-native-tabs';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

import { TabList, Tabs, TabSlot, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, View } from 'react-native';
import { Icon } from '~/lib/icons/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { cn } from '~/lib/cn';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

interface CustomTabButtonProps extends React.PropsWithChildren, TabTriggerSlotProps {
  route: string;
  IconComponent: (props: { isActive: boolean }) => React.JSX.Element;
}

const CustomTabButton = React.forwardRef<View, CustomTabButtonProps>(
  ({ IconComponent, ...rest }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          'px-sm py-md mx-3 flex-1 items-center border-t-2 bg-utility-500 pb-4 pt-6',
          rest.isFocused ? 'border-white' : 'border-transparent'
        )}
        {...rest}>
        <View className="gap-3xs flex-1 items-center">
          <IconComponent isActive={!!rest.isFocused} />
        </View>
      </Pressable>
    );
  }
);

const CustomTabTrigger = ({ route: route, ...rest }: CustomTabButtonProps) => {
  return (
    <TabTrigger name={route} asChild>
      <CustomTabButton route={route} {...rest} />
    </TabTrigger>
  );
};

const HomeButton = ({ isActive }: { isActive: boolean }) => {
  return <Icon name="house.fill" size={28} tintColor={isActive ? '#ffffff' : '#8B8B8B'} />;
};

const DiscoverButton = ({ isActive }: { isActive: boolean }) => {
  return <Icon name="magnifyingglass" size={28} tintColor={isActive ? '#ffffff' : '#8B8B8B'} />;
};

const ActivityButton = ({ isActive }: { isActive: boolean }) => {
  return <Icon name="note" size={28} tintColor={isActive ? '#ffffff' : '#8B8B8B'} />;
};

const ProfileButton = ({ isActive }: { isActive: boolean }) => {
  return <Icon name="person.fill" size={28} tintColor={isActive ? '#ffffff' : '#8B8B8B'} />;
};

const TabNavigation = () => {
  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex-row items-center justify-center bg-utility-500">
      <CustomTabTrigger route="home" IconComponent={HomeButton} />
      <CustomTabTrigger route="discover" IconComponent={DiscoverButton} />
      <CustomTabTrigger route="activity" IconComponent={ActivityButton} />
      <CustomTabTrigger route="profile" IconComponent={ProfileButton} />
    </SafeAreaView>
  );
};

// Defining the layout of the custom tab navigator
function CustomTabsLayout() {
  return (
    <Tabs className="">
      <View className="flex-1">
        <TabSlot />
        <TabNavigation />
      </View>

      {/* Hidden TabList for the router to pick up the screens */}
      <TabList className="hidden">
        <TabTrigger name="home" href="/app/(tabs)/home" />
        <TabTrigger name="discover" href="/app/(tabs)/discover" />
        <TabTrigger name="activity" href="/app/(tabs)/activity" />
        <TabTrigger name="profile" href="/app/(tabs)/profile" />
      </TabList>
    </Tabs>
  );
}

function NativeTabsLayout() {
  return (
    <BackgroundGradientView>
      <NativeTabs
        // iconColor="#8B8B8B"
        // tintColor="white"
        // disableTransparentOnScrollEdge
        minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="home" options={{ backgroundColor: 'transparent' }}>
          <NativeTabIcon sf="house.fill" drawable="custom_android_drawable" selectedColor="white" />
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="discover" role="search">
          <NativeTabIcon
            sf="magnifyingglass"
            drawable="custom_search_drawable"
            selectedColor="white"
          />
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="activity">
          <NativeTabIcon sf="note" drawable="custom_notifications_drawable" selectedColor="white" />
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabIcon
            sf="rectangle.stack.person.crop"
            drawable="custom_settings_drawable"
            selectedColor="white"
          />
          <Label hidden />
        </NativeTabs.Trigger>
      </NativeTabs>
    </BackgroundGradientView>
  );
}

export default function TabLayout() {
  return Platform.OS !== 'ios' ? <CustomTabsLayout /> : <NativeTabsLayout />;
}
