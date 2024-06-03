import { Nav } from './nav'
import { MainWithRefContext } from '@/components/main-with-ref'

interface UserScreensLayoutProps {
  title: React.ReactNode
  children: React.ReactNode
}
export default function UserScreensLayout({
  title,
  children
}: UserScreensLayoutProps) {
  return (
    <div className="grid-areas-user-screen grid-rows-user-screen grid-cols-user-screen  grid h-full pb-4">
      <header className="grid-in-title">{title}</header>
      <MainWithRefContext className="grid-in-content group/main grid overflow-y-auto p-4">
        {children}
      </MainWithRefContext>
      <Nav className="grid-in-nav z-10" />
    </div>
  )
}
