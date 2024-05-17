import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export interface LinkSectionProps {
  title: string
  links: { href: string; text: string; preview?: string }[]
}
export function LinkSection({ title, links }: LinkSectionProps) {
  return (
    <div className="border-b-border flex h-min w-full flex-col gap-2 divide-y divide-solid border-b">
      <h4 className="text-h4 text-secondary">{title}</h4>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-body flex items-center justify-between py-4"
        >
          {link.text}
          <div className="text-body-xs flex items-center gap-2">
            {link.preview} <ChevronRight size={16} />
          </div>
        </Link>
      ))}
    </div>
  )
}
