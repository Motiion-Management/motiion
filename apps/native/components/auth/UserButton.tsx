import { useClerk } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { Pressable } from 'react-native';

import { api } from '@packages/backend/convex/_generated/api';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { DropdownMenu } from '~/components/nativewindui/DropdownMenu';
import { Text } from '~/components/ui/text';

export function UserButton() {
  const { signOut } = useClerk();
  const user = useQuery(api.users.getMyUser);

  const getInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    const name = user.displayName || user.fullName;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <DropdownMenu
      items={[
        {
          actionKey: 'signout',
          title: 'Sign out',
        },
      ]}
      onItemPress={(item) => {
        if (item.actionKey === 'signout') {
          signOut();
        }
      }}>
      <Pressable>
        <Avatar alt={user?.displayName || user?.email || 'User avatar'} className="h-8 w-8">
          <AvatarFallback>
            <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
          </AvatarFallback>
        </Avatar>
      </Pressable>
    </DropdownMenu>
  );
}
