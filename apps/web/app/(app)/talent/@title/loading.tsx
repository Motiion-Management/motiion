import { Header } from '@/components/ui/header'
import { Skeleton } from '@/components/ui/skeleton'
export default function TitleLoading() {
  return <Header title="Loading..." actionSlot={<Skeleton />} />
}
