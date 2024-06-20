'use client'
import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { motion } from 'framer-motion'

export const FavoriteButton: FC<{ talentId: Id<'users'> }> = ({ talentId }) => {
  const user = useQuery(api.users.getMyUser)
  const isFavorite = useQuery(api.users.isFavoriteUser, { userId: talentId })

  const addFavorite = useMutation(api.users.addFavoriteUser)
  const removeFavorite = useMutation(api.users.removeFavoriteUser)

  const [loading, setLoading] = useState(false)

  const toggleFavorite = async () => {
    setLoading(true)
    if (isFavorite) {
      await removeFavorite({ userId: talentId })
    } else {
      await addFavorite({ userId: talentId })
    }
    setLoading(false)
  }

  if (!user) return null
  return (
    <Button variant="link" size="icon" className="" onClick={toggleFavorite}>
      <motion.div
        initial={{ fill: 'white' }}
        animate={{ fill: isFavorite ? 'gold' : 'white' }}
        whileTap={{ scale: 1.2 }}
        className={loading ? 'animate-pulse' : ''}
      >
        <Star className="fill-inherit" />
      </motion.div>
    </Button>
  )
}
