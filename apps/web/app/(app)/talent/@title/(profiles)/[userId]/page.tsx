import { BackButton } from '@/components/features/back-button'
import { Header } from '@/components/ui/header'
import { FavoriteButton } from './favorite-button'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export default async function FallbackTitleSlot(
  props: {
    params: Promise<{ userId: Id<'users'> }>
  }
) {
  const params = await props.params;

  const {
    userId
  } = params;

  return (
    <Header noSeparator>
      <div className="flex w-full justify-between">
        <BackButton />
        <FavoriteButton talentId={userId} />
      </div>
    </Header>
  )
}
