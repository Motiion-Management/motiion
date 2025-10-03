import { useClerk } from '@clerk/clerk-expo'
import { useQuery } from 'convex/react'
import { Pressable } from 'react-native'

import { api } from '@packages/backend/convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Text } from '~/components/ui/text'

export function UserButton() {
  const { signOut } = useClerk()
  const user = useQuery(api.users.users.getMyUser)
  const headshotUrl = useQuery(api.dancers.getMyDancerHeadshotUrl, {})

  const getInitials = () => {
    if (!user) return '?'
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    const name = user.displayName || user.fullName
    if (name) {
      const parts = name.split(' ')
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name[0].toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return '?'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <Avatar alt={user?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
            {headshotUrl && <AvatarImage source={{ uri: headshotUrl }} />}
            <AvatarFallback>
              <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
            </AvatarFallback>
          </Avatar>
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onPress={() => signOut()}>
          <Text>Sign out</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
