'use client'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { Button } from '../ui/button'
export const BackButton: FC = ({}) => {
  const router = useRouter()
  return (
    <Button
      variant="link"
      size="icon"
      onClick={() => router.back()}
      className=""
    >
      <ChevronLeft />
    </Button>
  )
}
