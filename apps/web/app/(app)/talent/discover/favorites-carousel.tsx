'use client'
import { FC } from 'react'
import { FeaturedCarousel } from './featured-carousel'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

export const FavoritesCarousel: FC = () => {
  const user = useQuery(api.users.getMyUser)
  const profiles = useQuery(api.users.getFavoriteUsersForCarousel) || []

  return (
    user && <FeaturedCarousel title="Favorite Profiles" profiles={profiles} />
  )
}
