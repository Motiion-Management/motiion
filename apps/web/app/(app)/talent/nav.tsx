'use client'
import { cn } from '@/lib/utils'
import { Cog, Home, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}
function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)
  return (
    <Link
      className={cn(
        'mx-2 flex flex-col items-center gap-1 py-3',
        isActive
          ? 'text-primary border-primary border-t-2'
          : 'text-muted-foreground'
      )}
      href={href}
    >
      {children}
    </Link>
  )
}

export function Nav({ className }: { className?: string }) {
  return (
    <nav className={cn('standalone:pb-4 -mb-8 border-t bg-white', className)}>
      <div className="mx-auto grid max-w-md grid-cols-4 grid-rows-1 gap-2 px-4">
        <NavLink href="/talent/home">
          <Home size={24} />
          <span className="block text-xs">Home</span>
        </NavLink>

        <NavLink href="/talent/discover">
          <Search size={24} />
          <span className="block text-xs">Discover</span>
        </NavLink>

        <NavLink href="/talent/profile">
          <User size={24} />
          <span className="block text-xs">Profile</span>
        </NavLink>

        <NavLink href="/talent/settings">
          <Cog size={24} />
          <span className="block text-xs">Settings</span>
        </NavLink>
      </div>
    </nav>
  )
}
