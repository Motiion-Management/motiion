import { cn } from '@/lib/utils'
import { ExternalLink as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className
}) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-link-sm flex items-center gap-2', className)}
    >
      {children}
      <LinkIcon size={16} />
    </Link>
  )
}
