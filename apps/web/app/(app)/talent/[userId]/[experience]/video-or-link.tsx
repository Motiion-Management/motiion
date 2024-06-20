'use client'
// import Link from 'next/link'
// import { LinkIcon } from 'lucide-react'
import { FC } from 'react'
import { Video } from '@/components/ui/video'

export const VideoOrLink: FC<{
  href?: string
}> = ({ href }) => {
  return href && <Video url={href} />
}
