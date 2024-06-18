'use client'
import ReactPlayer from 'react-player'
import Link from 'next/link'
import { LinkIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { FC } from 'react'

export const VideoOrLink: FC<{
  href?: string
}> = ({ href }) => {
  return (
    href && (
      <>
        <ReactPlayer
          lazy
          src={href}
          fallback={
            <Link href={href}>
              <LinkIcon size={24} />
            </Link>
          }
        />
        <Separator />
      </>
    )
  )
}
