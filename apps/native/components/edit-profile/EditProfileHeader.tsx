import React from 'react';
import { View } from 'react-native';
import { Href, Link, router } from 'expo-router';
import { useQuery } from 'convex/react';

import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import { Button } from '../ui/button';
import { Icon } from '~/lib/icons/Icon';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

export function EditProfileHeader(props: NativeStackHeaderProps) {
  const { user } = useUser();
  const profile = useQuery(api.dancers.getMyDancerProfile, {});

  const profileType = user?.activeProfileType || 'dancer';
  const displayName = profile?.displayName || user?.fullName || 'User';

  const profileTypeLabel = profileType.charAt(0).toUpperCase() + profileType.slice(1);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-row items-start justify-between bg-transparent px-4 pb-0">
      <View className="flex-row items-center gap-4">
        {/* Profile Avatar - Link to dancer profile */}
        {props.back?.href ? (
          <Link href={props.back.href as Href}>
            <Icon name="chevron.left" className="text-icon-default" />
          </Link>
        ) : (
          <View className="size-10" />
        )}

        {/* Account Switcher */}
        <View className="flex-1 gap-1">
          <Text variant="labelXs" className="text-center text-text-low">
            {displayName}
          </Text>
          <Text variant="header5" className="text-center">
            {profileTypeLabel}
          </Text>
        </View>
        {/* Notifications */}
        <Link href="/app/profile/settings" asChild>
          <Button variant="secondary" size="icon">
            <Icon name="gear" className="text-icon-default" size={28} />
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
