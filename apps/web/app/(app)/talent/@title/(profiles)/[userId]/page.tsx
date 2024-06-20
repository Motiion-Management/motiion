import { BackButton } from '@/components/features/back-button'
import { Header } from '@/components/ui/header'
import { FavoriteButton } from './favorite-button'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export default async function FallbackTitleSlot({
  params: { userId }
}: {
  params: { userId: Id<'users'> }
}) {
  return (
    <Header noSeparator>
      <div className="flex w-full justify-between">
        <BackButton />
        <FavoriteButton talentId={userId} />
      </div>
    </Header>
  )
}
